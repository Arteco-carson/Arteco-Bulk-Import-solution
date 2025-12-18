// bulk-import-api/BulkImportCompanyContacts/index.ts

import { app, HttpRequest, HttpResponseInit } from '@azure/functions'; 
import { SQLService } from '../shared/db.service'; 
import { getCompanyContactImportTsql } from '../shared/sql.templates'; 
import { parse } from 'csv-parse/sync';

app.http('BulkImportCompanyContacts', {
    methods: ['POST'],
    authLevel: 'function',
    handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
        
        let rawData: any[];
        
        try {
            const csvContent = await req.text();
            
            if (!csvContent || csvContent.trim().length === 0) {
                return { status: 400, jsonBody: { message: "The request body is empty." } };
            }

            // Clean the content to prevent "non trimable byte" errors
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

        const StagingTableName = "dbo.Staging_CompanyContacts"; 
        
        try {
            await SQLService.bulkInsert(StagingTableName, rawData);
            
            const tsqlCommand = getCompanyContactImportTsql(); 
            const mergeResult = await SQLService.executeTransaction(tsqlCommand);
            
            // Correctly access the RecordsInserted count
            const rowsAffected = mergeResult.recordset?.[0]?.['RecordsInserted'] || 0; 

            return {
                status: 200,
                jsonBody: {
                    message: `Company Contacts bulk import successful.`,
                    rowsInserted: rowsAffected,
                    stagingTable: StagingTableName
                }
            };
            
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : "An unknown server error occurred.";
            return {
                status: 500,
                jsonBody: {
                    message: "Company Contacts import failed due to a server error.",
                    details: errorMessage 
                }
            };
        }
    }
});