// bulk-import-api/BulkImportResources/index.ts

import { app, HttpRequest, HttpResponseInit } from '@azure/functions'; 
import { SQLService } from '../shared/db.service'; 
import { getResourceImportTsql } from '../shared/sql.templates';
import { parse } from 'csv-parse/sync';

interface ResourceImportData {
    title: string;
    article_summary: string;
    article_content: string;
    external_url: string;
    display_date_from: string;
    display_date_to: string;
    source_capture_location: string;
    raw_ArticleTypeName: string;
}

app.http('BulkImportResources', {
    methods: ['POST'],
    authLevel: 'function',
    handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
        let rawData: ResourceImportData[];
        
        try {
            const csvContent = await req.text();
            const cleanCsvContent = csvContent.trim().replace(/^\uFEFF/, '');

            // THE FIX: Use the CSV parser instead of req.json()
            rawData = parse(cleanCsvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true,
                relax_quotes: true,
                quote: '"'
            });

        } catch (error) {
            return { status: 400, jsonBody: { message: "Failed to parse CSV file.", error: error.message } };
        }

        const StagingTableName = "dbo.Staging_Resources";
        
        try {
            await SQLService.bulkInsert(StagingTableName, rawData);
            const tsqlCommand = getResourceImportTsql(); 
            const mergeResult = await SQLService.executeTransaction(tsqlCommand);
            
            return {
                status: 200,
                jsonBody: { message: "Resource import successful.", rowsInserted: mergeResult.recordset?.[0]?.['RecordsInserted'] || 0 }
            };
        } catch (error) {
            return { status: 500, jsonBody: { message: "Import failed.", details: error.message } };
        }
    }
});