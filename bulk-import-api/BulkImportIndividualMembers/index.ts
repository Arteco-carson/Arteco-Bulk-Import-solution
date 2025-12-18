// E:\Work\Arteco System\GitHub\Arteco-Bulk-Import-solution\bulk-import-api\BulkImportIndividualMembers\index.ts

import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { SQLService } from '../shared/db.service';
import { getIndividualImportTsql } from '../shared/sql.templates'; // Corrected name based on your TS error
import { parse } from 'csv-parse/sync';

interface IndividualMemberImportData {
    first_name: string;
    last_name: string;
    email_address: string;
    telephone_number?: string;
    address_1?: string;
    address_2?: string;
    address_3?: string;
    city?: string;
    county?: string;
    postcode?: string;
    membership_type: string;
    membership_start_date: string;
}

app.http('BulkImportIndividualMembers', {
    methods: ['POST'],
    authLevel: 'function',
    handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
        
        let rawData: IndividualMemberImportData[];
        
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
                jsonBody: { 
                    message: "Failed to parse Individual Members CSV file.", 
                    error: error instanceof Error ? error.message : String(error) 
                } 
            };
        }

        if (!rawData || rawData.length === 0) {
            return { status: 400, jsonBody: { message: "No data found in the CSV file." } };
        }

        const StagingTableName = "dbo.Staging_IndividualMembers";
        
        try {
            // 3. Stage data into the database
            await SQLService.bulkInsert(StagingTableName, rawData);
            
            // 4. Execute the T-SQL logic using the corrected function name
            const tsqlCommand = getIndividualImportTsql(); 
            const mergeResult = await SQLService.executeTransaction(tsqlCommand);
            
            // 5. Access the 'RecordsInserted' count from the SQL result
            const rowsAffected = mergeResult.recordset?.[0]?.['RecordsInserted'] || 0; 

            return {
                status: 200,
                jsonBody: {
                    message: `Individual Member bulk import successful.`,
                    rowsInserted: rowsAffected,
                    stagingTable: StagingTableName
                }
            };
            
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : "An unknown server error occurred.";
            return {
                status: 500,
                jsonBody: {
                    message: "Individual Member import failed due to a server error.",
                    details: errorMessage 
                }
            };
        }
    }
});