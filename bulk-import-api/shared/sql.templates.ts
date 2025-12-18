// bulk-import-api/shared/sql.templates.ts

/**
 * T-SQL for Resources Import
 */
export const getResourceImportTsql = () => `
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;
        DECLARE @ResourceMapping TABLE (NewID UNIQUEIDENTIFIER, Title NVARCHAR(MAX), DateFrom DATETIMEOFFSET);

        INSERT INTO dbo.resources (id, title, article_summary, article_content, external_url, display_date_from, display_date_to, source_capture_location, created_at, updated_at)
        OUTPUT inserted.id, inserted.title, inserted.display_date_from INTO @ResourceMapping (NewID, Title, DateFrom)
        SELECT NEWID(), title, article_summary, article_content, external_url, display_date_from, display_date_to, source_capture_location, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
        FROM dbo.Staging_Resources;

        INSERT INTO dbo.ResourceArticleType (ResourceID, ArticleTypeID)
        SELECT DISTINCT M.NewID, L.ID FROM dbo.Staging_Resources S
        INNER JOIN @ResourceMapping M ON S.title = M.Title AND S.display_date_from = M.DateFrom
        INNER JOIN dbo.ArticleTypeLookup L ON S.raw_ArticleTypeName = L.TypeName
        WHERE NOT EXISTS (SELECT 1 FROM dbo.ResourceArticleType ex WHERE ex.ResourceID = M.NewID AND ex.ArticleTypeID = L.ID);

        DECLARE @ResCount INT = (SELECT COUNT(*) FROM @ResourceMapping);
        TRUNCATE TABLE dbo.Staging_Resources;
    COMMIT TRANSACTION;
    SELECT @ResCount AS RecordsInserted;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
`;

/**
 * T-SQL for Individual Members Import
 */
export const getIndividualImportTsql = () => `
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;
        DECLARE @IndividualMapping TABLE (ImportEmail NVARCHAR(400), NewID UNIQUEIDENTIFIER);

        INSERT INTO dbo.members (id, first_name, last_name, address_1, address_2, address_3, city, county, contact_numbers, email_primary, dob, website, profile_image_url, CountryID, created_at, updated_at)
        OUTPUT inserted.email_primary, inserted.id INTO @IndividualMapping (ImportEmail, NewID)
        SELECT NEWID(), S.first_name, S.last_name, S.address_1, S.address_2, S.address_3, S.city, S.county, S.telephone_number, S.email_address, S.dob, S.website_url, S.profile_image_url, CL.id, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
        FROM dbo.Staging_IndividualMembers S LEFT JOIN dbo.CountryLookup CL ON S.raw_country = CL.CountryName;

        INSERT INTO dbo.MemberCategories (MemberID, CategoryID)
        SELECT DISTINCT M.NewID, L.ID FROM dbo.Staging_IndividualMembers S
        INNER JOIN @IndividualMapping M ON S.email_address = M.ImportEmail
        INNER JOIN dbo.MemberCategoryLookup L ON S.raw_member_category = L.CategoryName
        WHERE NOT EXISTS (SELECT 1 FROM dbo.MemberCategories ex WHERE ex.MemberID = M.NewID AND ex.CategoryID = L.ID);

        INSERT INTO dbo.MemberServiceProvided (MemberID, ServiceID)
        SELECT DISTINCT M.NewID, L.ID FROM dbo.Staging_IndividualMembers S
        CROSS APPLY STRING_SPLIT(S.raw_services_provided, ',') AS SplitSvc
        INNER JOIN @IndividualMapping M ON S.email_address = M.ImportEmail
        INNER JOIN dbo.ServicesProvidedLookup L ON TRIM(SplitSvc.value) = L.ServiceName
        WHERE NOT EXISTS (SELECT 1 FROM dbo.MemberServiceProvided ex WHERE ex.MemberID = M.NewID AND ex.ServiceID = L.ID);

        DECLARE @IndCount INT = (SELECT COUNT(*) FROM @IndividualMapping);
        TRUNCATE TABLE dbo.Staging_IndividualMembers;
    COMMIT TRANSACTION;
    SELECT @IndCount AS RecordsInserted;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
`;

/**
 * T-SQL for Company Members Import
 */
export const getCompanyImportTsql = () => `
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;
        DECLARE @CompanyMapping TABLE (ImportName NVARCHAR(MAX), NewID UNIQUEIDENTIFIER);

        INSERT INTO dbo.company_members (id, company_name, address_1, address_2, address_3, city, county, contact_numbers, email_public, website, CountryID, created_at, updated_at)
        OUTPUT inserted.company_name, inserted.id INTO @CompanyMapping (ImportName, NewID)
        SELECT NEWID(), S.company_name, S.address_1, S.address_2, S.address_3, S.city, S.county, S.telephone_number, S.email_address, S.website_url, CL.id, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
        FROM dbo.Staging_CompanyMembers S LEFT JOIN dbo.CountryLookup CL ON S.raw_country = CL.CountryName;

        INSERT INTO dbo.CompanyMemberCategories (CompanyMemberID, CategoryID)
        SELECT DISTINCT M.NewID, L.ID FROM dbo.Staging_CompanyMembers S
        INNER JOIN @CompanyMapping M ON S.company_name = M.ImportName
        INNER JOIN dbo.MemberCategoryLookup L ON S.raw_member_category = L.CategoryName
        WHERE NOT EXISTS (SELECT 1 FROM dbo.CompanyMemberCategories ex WHERE ex.CompanyMemberID = M.NewID AND ex.CategoryID = L.ID);

        -- FIXED: Table name corrected from CompanyMemberServiceProvided to CompanyServiceProvided
        INSERT INTO dbo.CompanyServiceProvided (CompanyMemberID, ServiceID)
        SELECT DISTINCT M.NewID, L.ID FROM dbo.Staging_CompanyMembers S
        CROSS APPLY STRING_SPLIT(S.raw_services_provided, ',') AS SplitSvc
        INNER JOIN @CompanyMapping M ON S.company_name = M.ImportName
        INNER JOIN dbo.ServicesProvidedLookup L ON TRIM(SplitSvc.value) = L.ServiceName
        WHERE NOT EXISTS (SELECT 1 FROM dbo.CompanyServiceProvided ex WHERE ex.CompanyMemberID = M.NewID AND ex.ServiceID = L.ID);

        DECLARE @CompCount INT = (SELECT COUNT(*) FROM @CompanyMapping);
        TRUNCATE TABLE dbo.Staging_CompanyMembers;
    COMMIT TRANSACTION;
    SELECT @CompCount AS RecordsInserted;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
`;

/**
 * T-SQL for Events Import
 */
export const getEventImportTsql = () => `
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;
        DECLARE @EventMapping TABLE (NewID UNIQUEIDENTIFIER, EventName NVARCHAR(MAX), DateFrom DATE);

        INSERT INTO dbo.events (id, calendar_date_from, calendar_date_to, event_name, venue, address_1, address_2, address_3, city, county, telephone_number, email_address, created_at, updated_at)
        OUTPUT inserted.id, inserted.event_name, inserted.calendar_date_from INTO @EventMapping (NewID, EventName, DateFrom)
        SELECT NEWID(), calendar_date_from, calendar_date_to, event_name, venue, address_1, address_2, address_3, city, county, telephone_number, email_address, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
        FROM dbo.Staging_Events;

        INSERT INTO dbo.EventType (EventID, EventTypeID)
        SELECT DISTINCT M.NewID, L.ID FROM dbo.Staging_Events S
        INNER JOIN @EventMapping M ON S.event_name = M.EventName AND S.calendar_date_from = M.DateFrom
        INNER JOIN dbo.EventTypeLookup L ON S.raw_EventTypeName = L.TypeName
        WHERE NOT EXISTS (SELECT 1 FROM dbo.EventType ex WHERE ex.EventID = M.NewID AND ex.EventTypeID = L.ID);

        DECLARE @EvtCount INT = (SELECT COUNT(*) FROM @EventMapping);
        TRUNCATE TABLE dbo.Staging_Events;
    COMMIT TRANSACTION;
    SELECT @EvtCount AS RecordsInserted;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
`;

/**
 * T-SQL for Company Contacts
 */
export const getCompanyContactImportTsql = () => `
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;
        INSERT INTO dbo.company_contacts (id, company_id, first_name, last_name, position, email, phone, profile_image_url, created_at, updated_at)
        SELECT NEWID(), C.id, S.first_name, S.last_name, S.position, S.email, S.phone, S.profile_image_url, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
        FROM dbo.Staging_CompanyContacts S INNER JOIN dbo.company_members C ON S.company_name = C.company_name;

        DECLARE @CtcCount INT = @@ROWCOUNT;
        TRUNCATE TABLE dbo.Staging_CompanyContacts;
    COMMIT TRANSACTION;
    SELECT @CtcCount AS RecordsInserted;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
`;