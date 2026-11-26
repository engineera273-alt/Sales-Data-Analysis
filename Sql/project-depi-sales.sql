SELECT *
FROM dbo.Sales;

SELECT TOP 10 *
FROM dbo.Sales;

SELECT
    OrderID,
    OrderDate,
    Product,
    OrderQty,
    UnitPrice
FROM dbo.Sales;

SELECT *
FROM dbo.Sales
WHERE UnitPrice > 500;


SELECT *
FROM dbo.Sales
WHERE UnitPrice < 100;


SELECT *
FROM dbo.Sales
WHERE OrderQty > 5;

SELECT DISTINCT ProductCategory
FROM dbo.Sales;

SELECT Product, UnitPrice
FROM dbo.Sales
ORDER BY UnitPrice DESC;


SELECT COUNT(*) AS TotalRows
FROM dbo.Sales;

SELECT
    SUM(OrderQty * UnitPrice) AS TotalSales
FROM dbo.Sales;

SELECT
    SUM(UnitPrice) AS TotalPrice,
    AVG(UnitPrice) AS AveragePrice,
    MAX(UnitPrice) AS HighestPrice,
    MIN(UnitPrice) AS LowestPrice,
    COUNT(*) AS TotalRecords
FROM dbo.Sales;

SELECT
    COUNT(*) AS Total_Rows,
    SUM(CASE WHEN OrderDetailID IS NULL THEN 1 ELSE 0 END) AS OrderDetailID_Nulls,
    SUM(CASE WHEN OrderID IS NULL THEN 1 ELSE 0 END) AS OrderID_Nulls,
    SUM(CASE WHEN OrderDate IS NULL THEN 1 ELSE 0 END) AS OrderDate_Nulls,
    SUM(CASE WHEN DueDate IS NULL THEN 1 ELSE 0 END) AS DueDate_Nulls,
    SUM(CASE WHEN ShipDate IS NULL THEN 1 ELSE 0 END) AS ShipDate_Nulls,
    SUM(CASE WHEN Status IS NULL THEN 1 ELSE 0 END) AS Status_Nulls,
    SUM(CASE WHEN CustomerID IS NULL THEN 1 ELSE 0 END) AS CustomerID_Nulls,
    SUM(CASE WHEN SalesPersonID IS NULL THEN 1 ELSE 0 END) AS SalesPersonID_Nulls,
    SUM(CASE WHEN Territory IS NULL THEN 1 ELSE 0 END) AS Territory_Nulls,
    SUM(CASE WHEN TerritoryGroup IS NULL THEN 1 ELSE 0 END) AS TerritoryGroup_Nulls,
    SUM(CASE WHEN ShipMethod IS NULL THEN 1 ELSE 0 END) AS ShipMethod_Nulls,
    SUM(CASE WHEN ProductID IS NULL THEN 1 ELSE 0 END) AS ProductID_Nulls,
    SUM(CASE WHEN Product IS NULL THEN 1 ELSE 0 END) AS Product_Nulls,
    SUM(CASE WHEN ProductSubCategory IS NULL THEN 1 ELSE 0 END) AS SubCat_Nulls,
    SUM(CASE WHEN ProductCategory IS NULL THEN 1 ELSE 0 END) AS Cat_Nulls,
    SUM(CASE WHEN OrderQty IS NULL THEN 1 ELSE 0 END) AS OrderQty_Nulls,
    SUM(CASE WHEN UnitPrice IS NULL THEN 1 ELSE 0 END) AS UnitPrice_Nulls,
    SUM(CASE WHEN TaxAmt IS NULL THEN 1 ELSE 0 END) AS TaxAmt_Nulls,
    SUM(CASE WHEN Freight IS NULL THEN 1 ELSE 0 END) AS Freight_Nulls
FROM Sales;
