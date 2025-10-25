import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { labs, labFiles } from '@/db';
import { eq } from 'drizzle-orm';
import { defineRoute } from '@/types/route';

type LabRouteParams = { id: string };

export const GET = defineRoute<LabRouteParams>(async (request: NextRequest, { params }) => {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Lab ID is required' },
        { status: 400 }
      );
    }

    // Get lab details with author information
    const [labData] = await db
      .select({
        id: labs.id,
        title: labs.title,
        description: labs.description,
        category: labs.category,
        difficulty: labs.difficulty,
        tags: labs.tags,
        createdAt: labs.createdAt,
        updatedAt: labs.updatedAt,
      })
      .from(labs)
      .where(eq(labs.id, id));

    if (!labData) {
      return NextResponse.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    // Get lab files
    const files = await db
      .select()
      .from(labFiles)
      .where(eq(labFiles.labId, id))
      .orderBy(labFiles.createdAt);

    // Create export data
    const exportData = {
      lab: labData,
      files: files.map(file => ({
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        description: file.description,
        downloadUrl: file.fileUrl, // In real implementation, this would be a pre-signed URL
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: 'NetLabShowcase Platform',
    };

    // Return as JSON download
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${labData.title.replace(/[^a-zA-Z0-9]/g, '_')}_export.json"`,
    });

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error exporting lab:', error);
    return NextResponse.json(
      { error: 'Failed to export lab' },
      { status: 500 }
    );
  }
});
