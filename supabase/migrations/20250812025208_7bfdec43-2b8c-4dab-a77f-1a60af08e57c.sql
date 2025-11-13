-- Delete existing 2025 CWS China records and insert final numbers
DELETE FROM sales_monthly 
WHERE period_month >= '2025-01-01' 
  AND period_month <= '2025-07-01' 
  AND category = 'cws_distributor';

-- Insert final 2025 sales data for CWS China
-- MoMing Flori Kombucha 750ml (Cuvée Flori - MO75001)
INSERT INTO sales_monthly (period_month, category, product_id, units, revenue, cost, currency, fx_to_cny) VALUES
('2025-01-01', 'cws_distributor', 'cbb200d7-3078-437e-bfbb-88b3d8bfecf0', 1, 1 * 290, 1 * 55, 'CNY', 1),
('2025-02-01', 'cws_distributor', 'cbb200d7-3078-437e-bfbb-88b3d8bfecf0', 59, 59 * 290, 59 * 55, 'CNY', 1),
('2025-03-01', 'cws_distributor', 'cbb200d7-3078-437e-bfbb-88b3d8bfecf0', 162, 162 * 290, 162 * 55, 'CNY', 1),
('2025-04-01', 'cws_distributor', 'cbb200d7-3078-437e-bfbb-88b3d8bfecf0', 225, 225 * 290, 225 * 55, 'CNY', 1),
('2025-05-01', 'cws_distributor', 'cbb200d7-3078-437e-bfbb-88b3d8bfecf0', 230, 230 * 290, 230 * 55, 'CNY', 1),
('2025-06-01', 'cws_distributor', 'cbb200d7-3078-437e-bfbb-88b3d8bfecf0', 172, 172 * 290, 172 * 55, 'CNY', 1),
('2025-07-01', 'cws_distributor', 'cbb200d7-3078-437e-bfbb-88b3d8bfecf0', 74, 74 * 290, 74 * 55, 'CNY', 1),

-- MoMing Lychee Jasmine Kombucha (MO23003)
('2025-01-01', 'cws_distributor', 'cbae9fb0-4f58-4c66-8ff2-400710e369b7', 1653, 1653 * 23, 1653 * 12, 'CNY', 1),
('2025-02-01', 'cws_distributor', 'cbae9fb0-4f58-4c66-8ff2-400710e369b7', 1055, 1055 * 23, 1055 * 12, 'CNY', 1),
('2025-03-01', 'cws_distributor', 'cbae9fb0-4f58-4c66-8ff2-400710e369b7', 1074, 1074 * 23, 1074 * 12, 'CNY', 1),
('2025-04-01', 'cws_distributor', 'cbae9fb0-4f58-4c66-8ff2-400710e369b7', 2253, 2253 * 23, 2253 * 12, 'CNY', 1),
('2025-05-01', 'cws_distributor', 'cbae9fb0-4f58-4c66-8ff2-400710e369b7', 1505, 1505 * 23, 1505 * 12, 'CNY', 1),
('2025-06-01', 'cws_distributor', 'cbae9fb0-4f58-4c66-8ff2-400710e369b7', 2356, 2356 * 23, 2356 * 12, 'CNY', 1),
('2025-07-01', 'cws_distributor', 'cbae9fb0-4f58-4c66-8ff2-400710e369b7', 3696, 3696 * 23, 3696 * 12, 'CNY', 1),

-- MoMing Pineapple Lavender (MO23001)
('2025-01-01', 'cws_distributor', '949eb8a1-730d-4f04-9c8b-f6e9a70baafb', 630, 630 * 23, 630 * 12, 'CNY', 1),
('2025-02-01', 'cws_distributor', '949eb8a1-730d-4f04-9c8b-f6e9a70baafb', 414, 414 * 23, 414 * 12, 'CNY', 1),
('2025-03-01', 'cws_distributor', '949eb8a1-730d-4f04-9c8b-f6e9a70baafb', 534, 534 * 23, 534 * 12, 'CNY', 1),
('2025-04-01', 'cws_distributor', '949eb8a1-730d-4f04-9c8b-f6e9a70baafb', 1423, 1423 * 23, 1423 * 12, 'CNY', 1),
('2025-05-01', 'cws_distributor', '949eb8a1-730d-4f04-9c8b-f6e9a70baafb', 1544, 1544 * 23, 1544 * 12, 'CNY', 1),
('2025-06-01', 'cws_distributor', '949eb8a1-730d-4f04-9c8b-f6e9a70baafb', 1094, 1094 * 23, 1094 * 12, 'CNY', 1),
('2025-07-01', 'cws_distributor', '949eb8a1-730d-4f04-9c8b-f6e9a70baafb', 1707, 1707 * 23, 1707 * 12, 'CNY', 1),

-- MoMing Pomelo Mint (MO23004)
('2025-01-01', 'cws_distributor', '2e6b4f77-2b75-4d61-af39-36b084222ad8', 801, 801 * 23, 801 * 12, 'CNY', 1),
('2025-02-01', 'cws_distributor', '2e6b4f77-2b75-4d61-af39-36b084222ad8', 582, 582 * 23, 582 * 12, 'CNY', 1),
('2025-03-01', 'cws_distributor', '2e6b4f77-2b75-4d61-af39-36b084222ad8', 840, 840 * 23, 840 * 12, 'CNY', 1),
('2025-04-01', 'cws_distributor', '2e6b4f77-2b75-4d61-af39-36b084222ad8', 1751, 1751 * 23, 1751 * 12, 'CNY', 1),
('2025-05-01', 'cws_distributor', '2e6b4f77-2b75-4d61-af39-36b084222ad8', 1000, 1000 * 23, 1000 * 12, 'CNY', 1),
('2025-06-01', 'cws_distributor', '2e6b4f77-2b75-4d61-af39-36b084222ad8', 1254, 1254 * 23, 1254 * 12, 'CNY', 1),
('2025-07-01', 'cws_distributor', '2e6b4f77-2b75-4d61-af39-36b084222ad8', 1994, 1994 * 23, 1994 * 12, 'CNY', 1),

-- MoMing Turmeric & Lemongrass (MO23002)
('2025-01-01', 'cws_distributor', '92f56f97-87a4-4bf9-9b9c-da1db4606693', 541, 541 * 23, 541 * 12, 'CNY', 1),
('2025-02-01', 'cws_distributor', '92f56f97-87a4-4bf9-9b9c-da1db4606693', 345, 345 * 23, 345 * 12, 'CNY', 1),
('2025-03-01', 'cws_distributor', '92f56f97-87a4-4bf9-9b9c-da1db4606693', 605, 605 * 23, 605 * 12, 'CNY', 1),
('2025-04-01', 'cws_distributor', '92f56f97-87a4-4bf9-9b9c-da1db4606693', 866, 866 * 23, 866 * 12, 'CNY', 1),
('2025-05-01', 'cws_distributor', '92f56f97-87a4-4bf9-9b9c-da1db4606693', 973, 973 * 23, 973 * 12, 'CNY', 1),
('2025-06-01', 'cws_distributor', '92f56f97-87a4-4bf9-9b9c-da1db4606693', 1119, 1119 * 23, 1119 * 12, 'CNY', 1),
('2025-07-01', 'cws_distributor', '92f56f97-87a4-4bf9-9b9c-da1db4606693', 770, 770 * 23, 770 * 12, 'CNY', 1),

-- MoMing West Lake Kombucha 750ml (Cuvée West Lake - MO75002)
('2025-01-01', 'cws_distributor', 'ce18f56f-5b98-45a5-bd2a-d53127dc54fb', 1, 1 * 290, 1 * 55, 'CNY', 1),
('2025-02-01', 'cws_distributor', 'ce18f56f-5b98-45a5-bd2a-d53127dc54fb', 36, 36 * 290, 36 * 55, 'CNY', 1),
('2025-03-01', 'cws_distributor', 'ce18f56f-5b98-45a5-bd2a-d53127dc54fb', 134, 134 * 290, 134 * 55, 'CNY', 1),
('2025-04-01', 'cws_distributor', 'ce18f56f-5b98-45a5-bd2a-d53127dc54fb', 112, 112 * 290, 112 * 55, 'CNY', 1),
('2025-05-01', 'cws_distributor', 'ce18f56f-5b98-45a5-bd2a-d53127dc54fb', 102, 102 * 290, 102 * 55, 'CNY', 1),
('2025-06-01', 'cws_distributor', 'ce18f56f-5b98-45a5-bd2a-d53127dc54fb', 106, 106 * 290, 106 * 55, 'CNY', 1),
('2025-07-01', 'cws_distributor', 'ce18f56f-5b98-45a5-bd2a-d53127dc54fb', 35, 35 * 290, 35 * 55, 'CNY', 1);