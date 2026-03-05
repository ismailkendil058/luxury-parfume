-- =====================================================
-- SQL TO DELETE ALL DATA FROM ALL TABLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Delete in reverse order of dependencies (CASCADE will handle this, but order matters for clarity)
TRUNCATE TABLE public.sale_items CASCADE;
TRUNCATE TABLE public.sales CASCADE;
TRUNCATE TABLE public.sessions CASCADE;
TRUNCATE TABLE public.product_sizes CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.workers CASCADE;

-- Verify all tables are now empty
SELECT 
  'sale_items' as table_name, count(*) as row_count FROM public.sale_items
UNION ALL
SELECT 'sales', count(*) FROM public.sales
UNION ALL
SELECT 'sessions', count(*) FROM public.sessions
UNION ALL
SELECT 'product_sizes', count(*) FROM public.product_sizes
UNION ALL
SELECT 'products', count(*) FROM public.products
UNION ALL
SELECT 'workers', count(*) FROM public.workers;

-- Success message
SELECT 'All tables have been truncated successfully!' as message;

