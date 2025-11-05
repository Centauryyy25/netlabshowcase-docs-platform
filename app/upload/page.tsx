'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileText, Package, ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import UploadTopologyImage from '@/components/labs/UploadTopologyImage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/octet-stream',
  'text/x-log',
  'text/x-config',
];

const CATEGORY_OPTIONS = ['Routing', 'Switching', 'Security', 'MPLS', 'Wireless', 'Voice', 'Data Center', 'Other'] as const
const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const
const STATUS_OPTIONS = ['draft', 'published'] as const

const REVIEW_TIMEOUT_SECONDS = 60;

const stripHtml = (value?: string) => {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const labFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  labNotes: z.string().optional(),
  category: z.enum(CATEGORY_OPTIONS),
  difficulty: z.enum(DIFFICULTY_OPTIONS),
  status: z.enum(STATUS_OPTIONS),
  tags: z.string().optional(),
  topologyImage: z.instanceof(File).optional(),
  additionalFiles: z.array(z.instanceof(File)).optional(),
});

type LabStatus = (typeof STATUS_OPTIONS)[number]

type LabFormData = z.infer<typeof labFormSchema>;

type CreateLabApiResponse =
  | { success: true; data: { id: string; title: string; status: LabStatus } }
  | { success: false; error?: string };

type UploadPageProps = {
  variant?: 'page' | 'modal';
};

export default function UploadPage({ variant = 'page' }: UploadPageProps = {}) {
  const { data: session, isPending } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const totalFormSteps = variant === 'modal' ? 5 : 4;
  const successStep = totalFormSteps + 1;
  const [uploadedLab, setUploadedLab] = useState<{
    id: string;
    title: string;
    status: 'draft' | 'published';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedTopologyUrl, setUploadedTopologyUrl] = useState<string | null>(null);
  const [reviewTimeLeft, setReviewTimeLeft] = useState<number | null>(null);

  const form = useForm<LabFormData>({
    resolver: zodResolver(labFormSchema),
    defaultValues: {
      title: '',
      description: '',
      labNotes: '',
      status: 'draft',
      tags: '',
    },
  });

  const watchedValues = form.watch();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, fieldName: 'topologyImage' | 'additionalFiles') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (fieldName === 'topologyImage') {
      const imageFile = files.find(file => file.type.startsWith('image/'));
      if (imageFile) {
        form.setValue('topologyImage', imageFile);
      } else {
        toast.error('Please drop an image file for topology');
      }
    } else {
      form.setValue('additionalFiles', files);
    }
  };

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File ${file.name} exceeds 10MB limit`);
      return false;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(`File ${file.name} has unsupported type`);
      return false;
    }
    return true;
  };

  const onSubmit: SubmitHandler<LabFormData> = async (data) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      if (!session?.user) {
        toast.error('You must be signed in to upload a lab.');
        setIsSubmitting(false);
        return;
      }
      // Step 1: Create the lab (include uploaded topology image URL if present)
      setUploadProgress(20);
      const labResponse = await fetch('/api/labs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          labNotes: data.labNotes ? data.labNotes : null,
          category: data.category,
          difficulty: data.difficulty,
          status: data.status,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
          user_id: session.user.id,
          topology_image_url: uploadedTopologyUrl,
        }),
      });

      if (!labResponse.ok) {
        let serverMsg = 'Failed to create lab';
        try {
          const err = await labResponse.json();
          if (err?.error) serverMsg = err.error;
        } catch {}
        throw new Error(serverMsg);
      }

      const labData = (await labResponse.json()) as CreateLabApiResponse;
      if (!labData.success) {
        throw new Error(labData.error ?? 'Failed to create lab');
      }

      const labId = labData.data.id;
      if (!labId) {
        throw new Error('Lab identifier missing from create response');
      }
      setUploadProgress(40);

      // Step 2: (Handled via Supabase direct upload component). Progress bump for UX.
      setUploadProgress(60);

      // Step 3: Upload additional files if provided
      if (data.additionalFiles && data.additionalFiles.length > 0) {
        const validFiles = data.additionalFiles.filter(validateFile);
        setUploadProgress(80);

        for (const file of validFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('labId', labId);
          formData.append('description', `Additional file: ${file.name}`);

          await fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });
        }
      }

      setUploadProgress(100);
      setUploadedLab(labData.data);
      setCurrentStep(successStep); // Success step
      toast.success('Lab uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : 'Failed to upload lab. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await form.trigger(fieldsToValidate, { shouldFocus: true });

    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalFormSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): Array<keyof LabFormData> => {
    if (step === 1) {
      return ['title', 'description'];
    }

    if (variant === 'modal') {
      if (step === 3) {
        return ['category', 'difficulty', 'status'];
      }
      return [];
    }

    if (step === 2) {
      return ['category', 'difficulty', 'status'];
    }

    return [];
  };

  useEffect(() => {
    if (currentStep !== totalFormSteps || isSubmitting) {
      setReviewTimeLeft(null);
      return;
    }

    setReviewTimeLeft(REVIEW_TIMEOUT_SECONDS);

    const interval = window.setInterval(() => {
      setReviewTimeLeft(prev => {
        if (prev === null) {
          return prev;
        }

        if (prev <= 1) {
          window.clearInterval(interval);
          toast.warning('Review session timed out. Please review your submission again.');
          setCurrentStep(Math.max(totalFormSteps - 1, 1));
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
      setReviewTimeLeft(null);
    };
  }, [currentStep, isSubmitting, totalFormSteps]);

  const renderBasicInformationSection = ({
    heading = 'Basic Information',
    description = 'Tell us about your networking lab',
    showTitle = true,
    showDescription = true,
    showNotes = true,
    showTags = true,
  }: {
    heading?: string;
    description?: string;
    showTitle?: boolean;
    showDescription?: boolean;
    showNotes?: boolean;
    showTags?: boolean;
  } = {}) => (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-bold sm:text-2xl">{heading}</h2>
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>

      {showTitle && (
        <FormField<LabFormData>
          control={form.control}
          name="title"
          render={({ field }) => {
            const { value, onChange, ...rest } = field;
            return (
              <FormItem>
                <FormLabel>Lab Title *</FormLabel>
                <FormControl>
                  <Input
                    {...rest}
                    placeholder="e.g., OSPF Area Configuration Lab"
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => onChange(event.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Give your lab a clear, descriptive title
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}

      {showDescription && (
        <FormField<LabFormData>
          control={form.control}
          name="description"
          render={({ field }) => {
            const { value, onChange, ...rest } = field;
            return (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    {...rest}
                    placeholder="Describe what students will learn and accomplish in this lab..."
                    className="min-h-32"
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => onChange(event.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of the lab objectives and requirements
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}

      {showNotes && (
        <FormField<LabFormData>
          control={form.control}
          name="labNotes"
          render={({ field }) => {
            const content = typeof field.value === 'string' ? field.value : '';
            return (
              <FormItem>
                <FormLabel>Detailed Notes</FormLabel>
                <FormControl>
                  <RichTextEditor value={content} onChange={field.onChange} />
                </FormControl>
                <FormDescription>
                  Tambahkan teori, konfigurasi, atau dokumentasi lengkap lab di sini.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}

      {showTags && (
        <FormField<LabFormData>
          control={form.control}
          name="tags"
          render={({ field }) => {
            const { value, onChange, ...rest } = field;
            return (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    {...rest}
                    placeholder="e.g., OSPF, Routing, IPv6 (comma-separated)"
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => onChange(event.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Add tags to help others find your lab (comma-separated)
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}
    </div>
  );

  const renderClassificationSection = ({
    heading = 'Classification',
    description = 'Help categorize your lab for better discovery',
  }: {
    heading?: string;
    description?: string;
  } = {}) => (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-bold sm:text-2xl">{heading}</h2>
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>

      <FormField<LabFormData>
        control={form.control}
        name="category"
        render={({ field }) => {
          const value = typeof field.value === 'string' ? field.value : '';
          return (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} value={value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Routing">Routing</SelectItem>
                  <SelectItem value="Switching">Switching</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="MPLS">MPLS</SelectItem>
                  <SelectItem value="Wireless">Wireless</SelectItem>
                  <SelectItem value="Voice">Voice</SelectItem>
                  <SelectItem value="Data Center">Data Center</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField<LabFormData>
        control={form.control}
        name="difficulty"
        render={({ field }) => {
          const value = typeof field.value === 'string' ? field.value : '';
          return (
            <FormItem>
              <FormLabel>Difficulty Level *</FormLabel>
              <Select onValueChange={field.onChange} value={value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Beginner">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Beginner</Badge>
                      <span className="text-sm">Basic concepts, 1-2 hours</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Intermediate">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Intermediate</Badge>
                      <span className="text-sm">Some experience required, 2-4 hours</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Advanced">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Advanced</Badge>
                      <span className="text-sm">Expert knowledge, 4+ hours</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField<LabFormData>
        control={form.control}
        name="status"
        render={({ field }) => {
          const value = typeof field.value === 'string' ? field.value : '';
          return (
            <FormItem>
              <FormLabel>Publishing Status</FormLabel>
              <Select onValueChange={field.onChange} value={value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Draft - Save but do not publish</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="published">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Published - Make publicly available</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );

  const renderFilesSection = ({
    heading = 'Files & Resources',
    description = 'Upload topology diagrams and configuration files',
  }: {
    heading?: string;
    description?: string;
  } = {}) => (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-bold sm:text-2xl">{heading}</h2>
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Topology Image (Optional)</label>
        <UploadTopologyImage
          className=""
          onUploaded={(publicUrl) => {
            setUploadedTopologyUrl(publicUrl ?? null);
          }}
        />
        {uploadedTopologyUrl && (
          <p className="break-all text-xs text-green-600">Uploaded URL: {uploadedTopologyUrl}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Additional Files (Optional)</label>
        <div
          className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleFileDrop(e, 'additionalFiles')}
        >
          <input
            type="file"
            multiple
            accept=".pkt,.zip,.txt,.cfg,.log"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              form.setValue('additionalFiles', files);
            }}
          />
          {form.watch('additionalFiles') && form.watch('additionalFiles')!.length > 0 ? (
            <div className="space-y-2">
              <Package className="mx-auto h-8 w-8 text-green-600" />
              <p className="text-sm text-green-600">
                {form.watch('additionalFiles')!.length} file(s) selected
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {form.watch('additionalFiles')?.map((file, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {file.name}
                  </Badge>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-full sm:w-auto"
                onClick={() => form.setValue('additionalFiles', [])}
              >
                Clear All
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag and drop files here, or click to select
              </p>
              <p className="text-xs text-gray-500">PKT, ZIP, TXT, CFG, LOG files up to 10MB each</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderReviewSection = ({
    heading = 'Review & Confirm',
    description = 'Double-check all details before submitting your lab.',
  }: {
    heading?: string;
    description?: string;
  } = {}) => {
    const {
      title,
      description: overviewDescription,
      labNotes,
      category,
      difficulty,
      status,
      tags,
      additionalFiles,
    } = watchedValues;

    const parsedTags =
      typeof tags === 'string'
        ? tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
        : [];

    const plainDescription =
      typeof overviewDescription === 'string' ? stripHtml(overviewDescription) : '';
    const plainNotes = typeof labNotes === 'string' ? stripHtml(labNotes) : '';
    const files = Array.isArray(additionalFiles) ? additionalFiles : [];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-xl font-bold sm:text-2xl">{heading}</h2>
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
        </div>

        {reviewTimeLeft !== null && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
            <Clock className="h-4 w-4" />
            <span>
              Confirm within {reviewTimeLeft} second{reviewTimeLeft === 1 ? '' : 's'} before the review resets.
            </span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Title</p>
            <p className="mt-2 text-base font-semibold text-foreground">{title || '—'}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="mt-2 text-base font-semibold capitalize text-foreground">{status || '—'}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Category</p>
            <p className="mt-2 text-base font-semibold text-foreground">{category || '—'}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
            <p className="mt-2 text-base font-semibold text-foreground">{difficulty || '—'}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-muted-foreground">Description</p>
          <p className="text-sm leading-relaxed text-foreground">{plainDescription || 'No description provided.'}</p>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-muted-foreground">Lab Notes</p>
          <p className="text-sm leading-relaxed text-foreground">{plainNotes || 'No lab notes added.'}</p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-muted-foreground">Tags</p>
          {parsedTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {parsedTags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No tags added.</p>
          )}
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-muted-foreground">Topology Image</p>
          {uploadedTopologyUrl ? (
            <a
              href={uploadedTopologyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View uploaded topology
            </a>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No topology image uploaded.</p>
          )}
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-muted-foreground">Additional Files</p>
          {files.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file, index) => {
                const fileName = typeof file?.name === 'string' ? file.name : `File ${index + 1}`;
                return (
                  <Badge key={`${fileName}-${index}`} variant="outline" className="text-xs font-medium">
                    {fileName}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No additional files selected.</p>
          )}
        </div>
      </div>
    );
  };

  const renderSuccessSection = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h2 className="mb-2 text-2xl font-bold">Lab Uploaded Successfully!</h2>
        <p className="text-muted-foreground">
          Your networking lab {uploadedLab ? `${uploadedLab.title}` : 'your submission'} has been{' '}
          {uploadedLab?.status === 'published' ? 'published' : 'saved as draft'}.
        </p>
      </div>
      <div className="flex justify-center gap-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        {uploadedLab && (
          <Button asChild>
            <Link href={`/labs/${uploadedLab.id}`}>View Lab</Link>
          </Button>
        )}
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === successStep) {
      return renderSuccessSection();
    }

    if (variant === 'modal') {
      switch (currentStep) {
        case 1:
          return renderBasicInformationSection({
            heading: 'Lab Overview',
            description: 'Start with the essentials to introduce your lab.',
            showNotes: false,
            showTags: false,
          });
        case 2:
          return renderBasicInformationSection({
            heading: 'Detailed Notes & Tags',
            description: 'Add in-depth guidance and keywords to help others find your lab.',
            showTitle: false,
            showDescription: false,
          });
        case 3:
          return renderClassificationSection({
            heading: 'Classification',
            description: 'Group your lab by type and difficulty.',
          });
        case 4:
          return renderFilesSection({
            heading: 'Files & Resources',
            description: 'Attach media and files that support your lab execution.',
          });
        case 5:
          return renderReviewSection({
            heading: 'Review & Confirm',
            description: 'Make sure everything looks correct before uploading your lab.',
          });
        default:
          return null;
      }
    }

    switch (currentStep) {
      case 1:
        return renderBasicInformationSection();
      case 2:
        return renderClassificationSection();
      case 3:
        return renderFilesSection();
      case 4:
        return renderReviewSection();
      default:
        return null;
    }
  };

  const stepTitles =
    variant === 'modal'
      ? ['Lab Overview', 'Detailed Notes & Tags', 'Classification', 'Files & Resources', 'Review & Confirm']
      : ['Basic Information', 'Classification', 'Files & Resources', 'Review & Confirm'];
  const activeStep = Math.min(currentStep, totalFormSteps);
  const isSuccessStep = currentStep === successStep;
  const activeStepTitle = isSuccessStep ? 'Upload Complete' : stepTitles[activeStep - 1] ?? '';
  const progressValue = (activeStep / totalFormSteps) * 100;

  if (currentStep === successStep) {
    return (
      <div
        className={
          variant === 'modal'
            ? 'mx-auto w-full max-w-3xl'
            : 'container mx-auto px-4 py-8 sm:px-6'
        }
      >
        <Card
          className={
            variant === 'modal'
              ? 'mx-auto border-white/5 bg-sidebar/60 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-sidebar/60'
              : 'mx-auto max-w-md'
          }
        >
          <CardContent className={variant === 'modal' ? 'px-6 py-8' : 'pt-6'}>{renderStepContent()}</CardContent>
        </Card>
      </div>
    );
  }

  if (isPending) {
    return (
      <div
        className={
          variant === 'modal'
            ? 'mx-auto w-full max-w-md'
            : 'container mx-auto px-4 py-8 sm:px-6'
        }
      >
        <Card
          className={
            variant === 'modal'
              ? 'border-white/5 bg-sidebar/60 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-sidebar/60'
              : 'mx-auto max-w-md'
          }
        >
          <CardHeader className={variant === 'modal' ? 'px-6 py-5' : undefined}>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Checking your session</CardDescription>
          </CardHeader>
          <CardContent className={variant === 'modal' ? 'px-6 py-5' : undefined}>
            <Progress value={30} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div
        className={
          variant === 'modal'
            ? 'mx-auto w-full max-w-md'
            : 'container mx-auto px-4 py-16 sm:px-6'
        }
      >
        <Card
          className={
            variant === 'modal'
              ? 'border-white/5 bg-sidebar/60 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-sidebar/60'
              : 'mx-auto max-w-xl'
          }
        >
          <CardHeader className={variant === 'modal' ? 'px-6 py-5' : undefined}>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need to be signed in to upload a lab.</CardDescription>
          </CardHeader>
          <CardContent className={variant === 'modal' ? 'px-6 py-5' : undefined}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="h-11 w-full sm:w-auto">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
                <Link href="/sign-up">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={
        variant === 'modal'
          ? 'mx-auto w-full'
          : 'container mx-auto px-4 py-8 sm:px-6'
      }
    >
      <div
        className={
          variant === 'modal'
            ? 'mx-auto w-full space-y-2'
            : 'mx-auto max-w-2xl px-4 sm:px-0'
        }
      >
        {/* Progress Bar */}
        <div className={variant === 'modal' ? 'mb-6' : 'mb-8'}>
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium">
              Step {activeStep} of {totalFormSteps}
            </span>
            <span className="text-xs text-muted-foreground sm:text-sm">{activeStepTitle}</span>
          </div>
          <Progress value={progressValue} className="w-full" />
        </div>

        <Card
          className={
            variant === 'modal'
              ? 'border-white/5 bg-sidebar/60 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-sidebar/60'
              : undefined
          }
        >
          {/* <CardHeader className={variant === 'modal' ? 'px-6 py-2' : 'px-4 py-4 sm:px-6 sm:py-2'}>
            <CardTitle className="text-xl sm:text-2xl">
              {variant === 'modal' ? 'Quick Upload Lab' : 'Upload New Lab'}
            </CardTitle>
            <CardDescription>
              {variant === 'modal'
                ? 'Complete the guided flow to publish your lab without leaving the dashboard.'
                : 'Share your networking knowledge with the community'}
            </CardDescription>
          </CardHeader> */}
          <CardContent className={variant === 'modal' ? 'px-6 py-2' : 'px-4 py-4 sm:px-6 sm:py-2'}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {renderStepContent()}

                {/* Navigation Buttons */}
                {currentStep !== successStep && (
                  <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full sm:w-auto"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>

                    {currentStep < totalFormSteps ? (
                      <Button type="button" className="h-11 w-full sm:w-auto" onClick={nextStep}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" className="h-11 w-full sm:w-auto" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Lab
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {/* Upload Progress */}
                {isSubmitting && (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
