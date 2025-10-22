'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileText, Image, Package, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

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

const labFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  category: z.enum(['Routing', 'Switching', 'Security', 'MPLS', 'Wireless', 'Voice', 'Data Center', 'Other'], {
    required_error: 'Please select a category',
  }),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    required_error: 'Please select a difficulty level',
  }),
  status: z.enum(['draft', 'published']).default('draft'),
  tags: z.string().optional(),
  topologyImage: z.instanceof(File).optional(),
  additionalFiles: z.array(z.instanceof(File)).optional(),
});

type LabFormData = z.infer<typeof labFormSchema>;

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedLab, setUploadedLab] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<LabFormData>({
    resolver: zodResolver(labFormSchema),
    defaultValues: {
      status: 'draft',
    },
  });

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, fieldName: 'topologyImage' | 'additionalFiles') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (fieldName === 'topologyImage') {
      const imageFile = files.find(file => file.type.startsWith('image/'));
      if (imageFile) {
        form.setValue(fieldName, imageFile);
      } else {
        toast.error('Please drop an image file for topology');
      }
    } else {
      form.setValue(fieldName, files);
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

  const onSubmit = async (data: LabFormData) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Create the lab
      setUploadProgress(20);
      const labResponse = await fetch('/api/labs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          status: data.status,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        }),
      });

      if (!labResponse.ok) {
        throw new Error('Failed to create lab');
      }

      const labData = await labResponse.json();
      const labId = labData.lab.id;
      setUploadProgress(40);

      // Step 2: Upload topology image if provided
      if (data.topologyImage && validateFile(data.topologyImage)) {
        const formData = new FormData();
        formData.append('file', data.topologyImage);
        formData.append('labId', labId);
        formData.append('description', 'Topology diagram image');

        const imageResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (imageResponse.ok) {
          setUploadProgress(60);
        }
      }

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
            body: formData,
          });
        }
      }

      setUploadProgress(100);
      setUploadedLab(labData.lab);
      setCurrentStep(4); // Success step
      toast.success('Lab uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload lab. Please try again.');
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

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['title', 'description'];
      case 2:
        return ['category', 'difficulty'];
      case 3:
        return [];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
              <p className="text-muted-foreground">Tell us about your networking lab</p>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lab Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., OSPF Area Configuration Lab" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your lab a clear, descriptive title
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what students will learn and accomplish in this lab..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of the lab objectives and requirements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., OSPF, Routing, IPv6 (comma-separated)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add tags to help others find your lab (comma-separated)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Classification</h2>
              <p className="text-muted-foreground">Help categorize your lab for better discovery</p>
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publishing Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Draft - Save but don't publish</span>
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
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Files & Resources</h2>
              <p className="text-muted-foreground">Upload topology diagrams and configuration files</p>
            </div>

            {/* Topology Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Topology Image (Optional)</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, 'topologyImage')}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) form.setValue('topologyImage', file);
                  }}
                />
                {form.watch('topologyImage') ? (
                  <div className="space-y-2">
                    <Image className="h-8 w-8 mx-auto text-green-600" />
                    <p className="text-sm text-green-600">
                      {form.watch('topologyImage')?.name}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue('topologyImage', undefined)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag and drop an image here, or click to select
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>
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
                Your networking lab "{uploadedLab?.title}" has been {uploadedLab?.status === 'published' ? 'published' : 'saved as draft'}.
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
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of 3</span>
            <span className="text-sm text-muted-foreground">
              {currentStep === 1 && 'Basic Information'}
              {currentStep === 2 && 'Classification'}
              {currentStep === 3 && 'Files & Resources'}
            </span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload New Lab</CardTitle>
            <CardDescription>
              Share your networking knowledge with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
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
                    <div className="flex justify-between text-sm">
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