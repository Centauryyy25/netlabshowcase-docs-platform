'use client';

import { useState } from 'react';
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
import { Upload, FileText, Package, ArrowLeft, ArrowRight, Check } from 'lucide-react';
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

export default function UploadPage() {
  const { data: session, isPending } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedLab, setUploadedLab] = useState<{
    id: string;
    title: string;
    status: 'draft' | 'published';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedTopologyUrl, setUploadedTopologyUrl] = useState<string | null>(null);

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
      setCurrentStep(4); // Success step
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
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): Array<keyof LabFormData> => {
    switch (step) {
      case 1:
        return ['title', 'description'] as Array<keyof LabFormData>
      case 2:
        return ['category', 'difficulty'] as Array<keyof LabFormData>
      case 3:
        return [] as Array<keyof LabFormData>
      default:
        return [] as Array<keyof LabFormData>
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-bold sm:text-2xl">Basic Information</h2>
              <p className="text-sm text-muted-foreground sm:text-base">Tell us about your networking lab</p>
            </div>

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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-bold sm:text-2xl">Classification</h2>
              <p className="text-sm text-muted-foreground sm:text-base">Help categorize your lab for better discovery</p>
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

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-bold sm:text-2xl">Files & Resources</h2>
              <p className="text-sm text-muted-foreground sm:text-base">Upload topology diagrams and configuration files</p>
            </div>

            {/* Topology Image Upload (Supabase Storage) */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Topology Image (Optional)</label>
              <UploadTopologyImage
                className=""
                onUploaded={(publicUrl) => {
                  setUploadedTopologyUrl(publicUrl ?? null);
                }}
              />
              {uploadedTopologyUrl && (
                <p className="text-xs text-green-600 break-all">Uploaded URL: {uploadedTopologyUrl}</p>
              )}
            </div>

            {/* Additional Files Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Additional Files (Optional)</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
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
                    <Package className="h-8 w-8 mx-auto text-green-600" />
                    <p className="text-sm text-green-600">
                      {form.watch('additionalFiles')!.length} file(s) selected
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center">
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
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag and drop files here, or click to select
                    </p>
                    <p className="text-xs text-gray-500">
                      PKT, ZIP, TXT, CFG, LOG files up to 10MB each
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Lab Uploaded Successfully!</h2>
              <p className="text-muted-foreground">
                Your networking lab {uploadedLab ? `${uploadedLab.title}` : 'your submission'} has been {uploadedLab?.status === 'published' ? 'published' : 'saved as draft'}.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
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

      default:
        return null;
    }
  };

  if (currentStep === 4) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Checking your session</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={30} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need to be signed in to upload a lab.</CardDescription>
          </CardHeader>
          <CardContent>
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
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl px-4 sm:px-0">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium">Step {currentStep} of 3</span>
            <span className="text-xs text-muted-foreground sm:text-sm">
              {currentStep === 1 && 'Basic Information'}
              {currentStep === 2 && 'Classification'}
              {currentStep === 3 && 'Files & Resources'}
            </span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="w-full" />
        </div>

        <Card>
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <CardTitle className="text-xl sm:text-2xl">Upload New Lab</CardTitle>
            <CardDescription>
              Share your networking knowledge with the community
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full sm:w-auto"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 3 ? (
                    <Button type="button" className="h-11 w-full sm:w-auto" onClick={nextStep}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" className="h-11 w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Lab
                        </>
                      )}
                    </Button>
                  )}
                </div>

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





