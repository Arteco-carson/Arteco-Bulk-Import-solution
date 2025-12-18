// bulk-import-api/BulkImportEvents/index.ts

import { app, HttpRequest, HttpResponseInit } from '@azure/functions'; 
import { SQLService } from '../shared/db.service'; 
import { getEventImportTsql } from '../shared/sql.templates'; 
import { parse } from 'csv-parse/sync'; // Added import

interface EventImportData {
    calendar_date_from: string;
    calendar_date_to: string;
    event_name: string;
    venue: string;
    address_1: string;
    address_2: string; 
    address_3: string;
    city: string;
    county: string;
    telephone_number: string;
    email_address: string;
    raw_EventTypeName: string;
}

app.http('BulkImportEvents', {
    methods: ['POST'],
    authLevel: 'function',
    handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
        
        let rawData: EventImportData[];
        
        try {
            // 1. Read as text to handle CSV format
            const csvContent = await req.text();
            
            if (!csvContent || csvContent.trim().length === 0) {
                return { status: 400, jsonBody: { message: "The request body is empty." } };
            }

            // 2. Remove UTF-8 BOM and parse
            const cleanCsvContent = csvContent.trim().replace(/^\uFEFF/, '');

            rawData = parse(cleanCsvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true,
                relax_quotes: true,
                quote: '"'
            });

        } catch (error) {
            return { 
                status: 400, 
                jsonBody: { message: "Failed to parse CSV file.", error: error instanceof Error ? error.message : String(error) } 
            };
        }

        if (!rawData || rawData.length === 0) {
            return { status: 400, jsonBody: { message: "No data found in the CSV file." } };
        }

        const StagingTableName = "dbo.Staging_Events";
        
        try {
            // 3. Stage data
            await SQLService.bulkInsert(StagingTableName, rawData);
            
            // 4. Execute transaction
            const tsqlCommand = getEventImportTsql(); 
            const mergeResult = await SQLService.executeTransaction(tsqlCommand);
            
            // 5. Correctly access 'RecordsInserted' from sql.templates.ts
            const rowsAffected = mergeResult.recordset?.[0]?.['RecordsInserted'] || 0; 

            return {
                status: 200,
                jsonBody: {
                    message: `Event bulk import successful.`,
                    rowsInserted: rowsAffected,
                    stagingTable: StagingTableName
                }
            };
            
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : "An unknown server error occurred.";
            return {
                status: 500,
                jsonBody: {
                    message: "Event import failed due to a server error.",
                    details: errorMessage 
                }
            };
        }
    }
});