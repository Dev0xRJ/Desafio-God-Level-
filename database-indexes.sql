-- Índices recomendados para melhorar performance das queries
-- Execute este script no banco de dados após popular os dados

-- Índices principais para tabela sales
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(sale_status_desc);
CREATE INDEX IF NOT EXISTS idx_sales_channel ON sales(channel_id);
CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id) WHERE customer_id IS NOT NULL;

-- Índice composto para queries comuns de analytics
CREATE INDEX IF NOT EXISTS idx_sales_status_created ON sales(sale_status_desc, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_channel_status_created ON sales(channel_id, sale_status_desc, created_at);

-- Índices para product_sales
CREATE INDEX IF NOT EXISTS idx_product_sales_sale ON product_sales(sale_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_product ON product_sales(product_id);

-- Índices para delivery
CREATE INDEX IF NOT EXISTS idx_delivery_sales_sale ON delivery_sales(sale_id);
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_sale ON delivery_addresses(sale_id);
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_city_neighborhood ON delivery_addresses(city, neighborhood);

-- Índices para customers
CREATE INDEX IF NOT EXISTS idx_customers_id ON customers(id);

-- Análise das tabelas para otimizar
ANALYZE sales;
ANALYZE product_sales;
ANALYZE delivery_addresses;
ANALYZE customers;

