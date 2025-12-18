// bulk-import-api/BulkImportCompanyMembers/index.ts

import { app, HttpRequest, HttpResponseInit } from '@azure/functions'; 
import { SQLService } from '../shared/db.service'; 
import { getCompanyImportTsql } from '../shared/sql.templates';
import { parse } from 'csv-parse/sync';

interface CompanyMemberImportData {
    company_name: string;
    address_1: string;
    address_2: string;
    address_3: string;
    city: string;
    county: string;
    raw_country: string;
    telephone_number: string;
    email_address: string;
    website_url: string;
    raw_member_category: string;
    raw_services_provided: string;
    raw_source_type: string;
}

app.http('BulkImportCompanyMembers', {
    methods: ['POST'],
    authLevel: 'function',
    handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
        
        let rawData: CompanyMemberImportData[];
        
        try {
            const csvContent = await req.text();
            
            if (!csvContent || csvContent.trim().length === 0) {
                return { 
                    status: 400, 
                    jsonBody: { message: "The request body is empty." } 
                };
            }

            const cleanCsvContent = csvContent.trim().replace(/^\uFEFF/, '');

            // THE FIX: Adding relax_quotes handles quotes inside fields correctly
            rawData = parse(cleanCsvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true,
                relax_quotes: true, 
                quote: '"',
                escape: '"'
            });

        } catch (error) {
            return { 
                status: 400, 
                jsonBody: { 
                    message: "Failed to parse CSV file.", 
                    error: error instanceof Error ? error.message : String(error) 
                } 
            };
        }

        if (!rawData || rawData.length === 0) {
            return { 
                status: 400, 
                jsonBody: { message: "No data found in the CSV file." } 
            };
        }

        const StagingTableName = "dbo.Staging_CompanyMembers";
        
        try {
            await SQLService.bulkInsert(StagingTableName, rawData);
            
            const tsqlCommand = getCompanyImportTsql(); 
            const mergeResult = await SQLService.executeTransaction(tsqlCommand);
            
            const rowsAffected = mergeResult.recordset?.[0]?.['RecordsInserted'] || 0; 

            return {
                status: 200,
                jsonBody: {
                    message: `Company Member bulk import successful.`,
                    rowsInserted: rowsAffected,
                    stagingTable: StagingTableName
                }
            };
            
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : "An unknown server error occurred.";
            return {
                status: 500,
                jsonBody: {
                    message: "Company Member import failed due to a server error.",
                    details: errorMessage 
                }
            };
        }
    }
});