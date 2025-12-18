// bulk-import-api/shared/db.service.ts

import * as sql from 'mssql';
import { Table, TYPES } from 'mssql';

const connectionString = process.env.SqlConnectionString;

export const SQLService = {
    bulkInsert: async (tableName: string, rowsToInsert: any[]): Promise<void> => {
        if (!connectionString) throw new Error("SqlConnectionString not defined.");

        let pool;
        try {
            pool = await sql.connect(connectionString);
            const table = new Table(tableName);

            if (tableName === 'dbo.Staging_CompanyMembers') {
                table.columns.add('company_name', TYPES.NVarChar(4000));
                table.columns.add('address_1', TYPES.NVarChar(4000));
                table.columns.add('address_2', TYPES.NVarChar(4000));
                table.columns.add('address_3', TYPES.NVarChar(4000));
                table.columns.add('city', TYPES.NVarChar(4000));
                table.columns.add('county', TYPES.NVarChar(4000));
                table.columns.add('telephone_number', TYPES.NVarChar(4000));
                table.columns.add('email_address', TYPES.NVarChar(4000));
                table.columns.add('website_url', TYPES.NVarChar(4000));
                table.columns.add('raw_member_category', TYPES.NVarChar(4000));
                table.columns.add('raw_services_provided', TYPES.NVarChar(4000));
                table.columns.add('raw_source_captured', TYPES.NVarChar(4000));
                table.columns.add('raw_country', TYPES.NVarChar(4000));
                table.columns.add('raw_source_type', TYPES.NVarChar(4000));

                rowsToInsert.forEach(row => {
                    table.rows.add(
                        row.company_name || null, row.address_1 || null, row.address_2 || null, 
                        row.address_3 || null, row.city || null, row.county || null, 
                        row.telephone_number || null, row.email_address || null, 
                        row.website_url || null, row.raw_member_category || null, 
                        row.raw_services_provided || null, row.raw_source_captured || null, 
                        row.raw_country || null, row.raw_source_type || null
                    );
                });

            } else if (tableName === 'dbo.Staging_IndividualMembers') {
                table.columns.add('first_name', TYPES.NVarChar(255));
                table.columns.add('last_name', TYPES.NVarChar(255));
                table.columns.add('address_1', TYPES.NVarChar(1000));
                table.columns.add('address_2', TYPES.NVarChar(1000));
                table.columns.add('address_3', TYPES.NVarChar(1000));
                table.columns.add('city', TYPES.NVarChar(255));
                table.columns.add('county', TYPES.NVarChar(255));
                table.columns.add('dob', TYPES.Date);
                table.columns.add('telephone_number', TYPES.NVarChar(255));
                table.columns.add('email_address', TYPES.NVarChar(255));
                table.columns.add('website_url', TYPES.NVarChar(1000));
                table.columns.add('profile_image_url', TYPES.NVarChar(1000));
                table.columns.add('raw_member_category', TYPES.NVarChar(255));
                table.columns.add('raw_services_provided', TYPES.NVarChar(1000));
                table.columns.add('raw_country', TYPES.NVarChar(255));
                table.columns.add('raw_source_type', TYPES.NVarChar(255));
                table.columns.add('raw_source_captured', TYPES.NVarChar(4000));

                rowsToInsert.forEach(row => {
                    table.rows.add(
                        row.first_name || null, row.last_name || null, row.address_1 || null, 
                        row.address_2 || null, row.address_3 || null, row.city || null, 
                        row.county || null, row.dob ? new Date(row.dob) : null, 
                        row.telephone_number || null, row.email_address || null, 
                        row.website_url || null, row.profile_image_url || null, 
                        row.raw_member_category || null, row.raw_services_provided || null, 
                        row.raw_country || null, row.raw_source_type || null, row.raw_source_captured || null
                    );
                });

            } else if (tableName === 'dbo.Staging_Resources') {
                table.columns.add('title', TYPES.NVarChar(sql.MAX));
                table.columns.add('article_summary', TYPES.NVarChar(sql.MAX));
                table.columns.add('article_content', TYPES.NVarChar(sql.MAX));
                table.columns.add('external_url', TYPES.NVarChar(sql.MAX));
                table.columns.add('display_date_from', TYPES.Date);
                table.columns.add('display_date_to', TYPES.Date);
                table.columns.add('source_capture_location', TYPES.NVarChar(sql.MAX));
                table.columns.add('raw_ArticleTypeName', TYPES.NVarChar(255));

                rowsToInsert.forEach(row => {
                    table.rows.add(
                        row.title || null, row.article_summary || null, row.article_content || null, 
                        row.external_url || null, 
                        row.display_date_from ? new Date(row.display_date_from) : null, 
                        row.display_date_to ? new Date(row.display_date_to) : null, 
                        row.source_capture_location || null, row.raw_ArticleTypeName || null
                    );
                });

            } else if (tableName === 'dbo.Staging_Events') {
                table.columns.add('NewEventID', TYPES.UniqueIdentifier);
                table.columns.add('calendar_date_from', TYPES.Date);
                table.columns.add('calendar_date_to', TYPES.Date);
                table.columns.add('event_name', TYPES.NVarChar(sql.MAX));
                table.columns.add('venue', TYPES.NVarChar(sql.MAX));
                table.columns.add('address_1', TYPES.NVarChar(sql.MAX));
                table.columns.add('address_2', TYPES.NVarChar(sql.MAX));
                table.columns.add('address_3', TYPES.NVarChar(sql.MAX));
                table.columns.add('city', TYPES.NVarChar(sql.MAX));
                table.columns.add('county', TYPES.NVarChar(sql.MAX));
                table.columns.add('country', TYPES.NVarChar(sql.MAX));
                table.columns.add('telephone_number', TYPES.NVarChar(sql.MAX));
                table.columns.add('email_address', TYPES.NVarChar(sql.MAX));
                table.columns.add('raw_EventTypeName', TYPES.NVarChar(255));
                
                rowsToInsert.forEach(row => {
                    table.rows.add(
                        null,
                        row.calendar_date_from ? new Date(row.calendar_date_from) : null, 
                        row.calendar_date_to ? new Date(row.calendar_date_to) : null, 
                        row.event_name || null, row.venue || null, row.address_1 || null, 
                        row.address_2 || null, row.address_3 || null, row.city || null, 
                        row.county || null, row.country || null, row.telephone_number || null, 
                        row.email_address || null, row.raw_EventTypeName || null
                    );
                });

            } else if (tableName === 'dbo.Staging_CompanyContacts') {
                table.columns.add('company_name', TYPES.NVarChar(1000));
                table.columns.add('first_name', TYPES.NVarChar(255));
                table.columns.add('last_name', TYPES.NVarChar(255));
                table.columns.add('position', TYPES.NVarChar(255));
                table.columns.add('email', TYPES.NVarChar(255));
                table.columns.add('phone', TYPES.NVarChar(255));
                table.columns.add('profile_image_url', TYPES.NVarChar(1000));

                rowsToInsert.forEach(row => {
                    table.rows.add(
                        row.company_name || null, row.first_name || null, row.last_name || null, 
                        row.position || null, row.email || null, row.phone || null, 
                        row.profile_image_url || null
                    );
                });
            } else {
                throw new Error(`Unknown staging table name: ${tableName}`);
            }

            const request = pool.request();
            await request.query(`TRUNCATE TABLE ${tableName}`);
            await request.bulk(table);
        } catch (error) { throw error; } finally { if (pool) await pool.close(); }
    },

    executeTransaction: async (tsql: string): Promise<any> => {
        if (!connectionString) throw new Error("SqlConnectionString not defined.");
        let pool;
        try {
            pool = await sql.connect(connectionString);
            const request = pool.request();
            const result = await request.query(tsql);
            return result;
        } catch (error) {
            // SAFEGUARD: Ensure any dangling transaction is cleared if the execution fails
            if (pool) {
                try { await pool.request().query("IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;"); } catch (rollbackErr) {}
            }
            throw error;
        } finally {
            if (pool) await pool.close();
        }
    }
};