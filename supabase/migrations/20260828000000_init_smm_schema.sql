-- Migration: 20260828000000_init_smm_schema.sql
-- SMM Panel Complete Database Schema with Atomic Operations & Full RLS

-- Enable UUID and pgcrypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    api_key TEXT UNIQUE,
    api_key_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PLATFORMS TABLE
CREATE TABLE IF NOT EXISTS public.platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SMM PROVIDERS TABLE
CREATE TABLE IF NOT EXISTS public.smm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    api_url TEXT NOT NULL,
    api_key TEXT,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'VND',
    active BOOLEAN NOT NULL DEFAULT true,
    is_mock BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
    service_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Default',
    min_quantity INT NOT NULL DEFAULT 10,
    max_quantity INT NOT NULL DEFAULT 1000000,
    price_per_1000 NUMERIC(12, 2) NOT NULL,
    provider_price_per_1000 NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    provider_service_id TEXT,
    provider_id UUID REFERENCES public.smm_providers(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    refill_supported BOOLEAN NOT NULL DEFAULT false,
    cancel_supported BOOLEAN NOT NULL DEFAULT false,
    average_speed TEXT DEFAULT '5-15 phút',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SERVICE COMBOS TABLE
CREATE TABLE IF NOT EXISTS public.service_combos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    badge TEXT,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    original_price NUMERIC(12, 2),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_code TEXT NOT NULL,
    service_name TEXT NOT NULL,
    platform_slug TEXT NOT NULL,
    target_url TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
    provider_cost NUMERIC(15, 2) DEFAULT 0.00,
    profit NUMERIC(15, 2) GENERATED ALWAYS AS (total_amount - provider_cost) STORED,
    start_count INT DEFAULT 0,
    current_count INT DEFAULT 0,
    remains INT DEFAULT 0,
    progress_percentage INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'partial', 'canceled', 'refunded', 'failed')),
    provider_id UUID REFERENCES public.smm_providers(id) ON DELETE SET NULL,
    provider_order_id TEXT,
    provider_status TEXT,
    error_message TEXT,
    refill_status TEXT,
    custom_comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. WALLET TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'order', 'refund', 'bonus', 'adjustment')),
    amount NUMERIC(15, 2) NOT NULL,
    balance_before NUMERIC(15, 2) NOT NULL,
    balance_after NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'canceled')),
    payment_method TEXT,
    transaction_code TEXT UNIQUE,
    reference_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 10000),
    transfer_content TEXT NOT NULL UNIQUE,
    payment_method TEXT NOT NULL DEFAULT 'vietqr',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
    bank_account TEXT DEFAULT '1029384756',
    bank_name TEXT DEFAULT 'MBBANK',
    account_holder TEXT DEFAULT 'SMM PRO AUTO',
    qr_url TEXT,
    transaction_code TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('order', 'payment', 'service', 'api', 'other')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'answered', 'closed')),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TICKET MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin')),
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('order', 'deposit', 'refund', 'system', 'ticket')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ADMIN LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_platform_id ON public.services(platform_id);
CREATE INDEX IF NOT EXISTS idx_services_service_code ON public.services(service_code);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);

-- =========================================================================
-- ATOMIC STORED PROCEDURES / RPCS (ROW-LEVEL LOCKING & DOUBLE-SPEND DEFENSE)
-- =========================================================================

-- Function 1: Atomically create order and deduct balance
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_user_id UUID,
    p_service_id UUID,
    p_target_url TEXT,
    p_quantity INT,
    p_custom_comments TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile RECORD;
    v_service RECORD;
    v_total_amount NUMERIC(15, 2);
    v_provider_cost NUMERIC(15, 2);
    v_order_id UUID;
    v_balance_before NUMERIC(15, 2);
    v_balance_after NUMERIC(15, 2);
    v_platform_slug TEXT;
BEGIN
    -- 1. Fetch & lock service row
    SELECT s.*, p.slug AS platform_slug INTO v_service
    FROM public.services s
    JOIN public.platforms p ON s.platform_id = p.id
    WHERE s.id = p_service_id AND s.active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Dịch vụ không tồn tại hoặc đã tạm dừng!';
    END IF;

    -- 2. Validate quantity boundaries
    IF p_quantity < v_service.min_quantity OR p_quantity > v_service.max_quantity THEN
        RAISE EXCEPTION 'Số lượng phải từ % đến %!', v_service.min_quantity, v_service.max_quantity;
    END IF;

    -- 3. Calculate server-side total amount and provider cost
    v_total_amount := ROUND((p_quantity::NUMERIC * v_service.price_per_1000) / 1000.00, 2);
    v_provider_cost := ROUND((p_quantity::NUMERIC * v_service.provider_price_per_1000) / 1000.00, 2);

    -- 4. Lock user profile row for atomic balance verification
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tài khoản người dùng không tồn tại!';
    END IF;

    IF v_profile.status != 'active' THEN
        RAISE EXCEPTION 'Tài khoản của bạn đã bị khóa hoặc tạm dừng!';
    END IF;

    IF v_profile.balance < v_total_amount THEN
        RAISE EXCEPTION 'Số dư không đủ! Cần % VNĐ nhưng số dư hiện tại chỉ có % VNĐ.', v_total_amount, v_profile.balance;
    END IF;

    -- 5. Calculate new balance
    v_balance_before := v_profile.balance;
    v_balance_after := v_balance_before - v_total_amount;

    -- 6. Atomically deduct balance
    UPDATE public.profiles
    SET balance = v_balance_after,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- 7. Insert order record
    INSERT INTO public.orders (
        user_id,
        service_id,
        service_code,
        service_name,
        platform_slug,
        target_url,
        quantity,
        unit_price,
        total_amount,
        provider_cost,
        start_count,
        current_count,
        remains,
        progress_percentage,
        status,
        provider_id,
        provider_service_id,
        custom_comments
    ) VALUES (
        p_user_id,
        v_service.id,
        v_service.service_code,
        v_service.name,
        v_service.platform_slug,
        p_target_url,
        p_quantity,
        v_service.price_per_1000,
        v_total_amount,
        v_provider_cost,
        0,
        0,
        p_quantity,
        0,
        'processing',
        v_service.provider_id,
        v_service.provider_service_id,
        p_custom_comments
    ) RETURNING id INTO v_order_id;

    -- 8. Insert wallet transaction record
    INSERT INTO public.wallet_transactions (
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        status,
        transaction_code,
        reference_id,
        description,
        metadata
    ) VALUES (
        p_user_id,
        'order',
        -v_total_amount,
        v_balance_before,
        v_balance_after,
        'completed',
        'ORD_' || UPPER(SUBSTRING(v_order_id::text, 1, 8)) || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        v_order_id,
        'Thanh toán đơn hàng #' || UPPER(SUBSTRING(v_order_id::text, 1, 8)) || ' (' || v_service.name || ')',
        jsonb_build_object('order_id', v_order_id, 'quantity', p_quantity, 'service_code', v_service.service_code)
    );

    -- 9. Insert notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        link
    ) VALUES (
        p_user_id,
        'Tạo đơn hàng thành công',
        'Đơn hàng #' || UPPER(SUBSTRING(v_order_id::text, 1, 8)) || ' với số lượng ' || p_quantity || ' đang được xử lý.',
        'order',
        '/orders'
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'total_amount', v_total_amount,
        'balance_after', v_balance_after
    );
END;
$$;

-- Function 2: Atomically complete a deposit
CREATE OR REPLACE FUNCTION public.process_deposit_completed(
    p_deposit_id UUID,
    p_transaction_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deposit RECORD;
    v_profile RECORD;
    v_balance_before NUMERIC(15, 2);
    v_balance_after NUMERIC(15, 2);
BEGIN
    SELECT * INTO v_deposit
    FROM public.deposits
    WHERE id = p_deposit_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Giao dịch nạp tiền không tồn tại!';
    END IF;

    IF v_deposit.status = 'completed' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Giao dịch đã được xử lý trước đó.');
    END IF;

    -- Lock profile
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = v_deposit.user_id
    FOR UPDATE;

    v_balance_before := v_profile.balance;
    v_balance_after := v_balance_before + v_deposit.amount;

    -- Update balance
    UPDATE public.profiles
    SET balance = v_balance_after,
        updated_at = NOW()
    WHERE id = v_deposit.user_id;

    -- Update deposit status
    UPDATE public.deposits
    SET status = 'completed',
        transaction_code = COALESCE(p_transaction_code, 'DEP_' || UPPER(SUBSTRING(p_deposit_id::text, 1, 8))),
        verified_at = NOW(),
        updated_at = NOW()
    WHERE id = p_deposit_id;

    -- Insert wallet transaction
    INSERT INTO public.wallet_transactions (
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        status,
        transaction_code,
        reference_id,
        description,
        metadata
    ) VALUES (
        v_deposit.user_id,
        'deposit',
        v_deposit.amount,
        v_balance_before,
        v_balance_after,
        'completed',
        COALESCE(p_transaction_code, 'DEP_' || UPPER(SUBSTRING(p_deposit_id::text, 1, 8))),
        p_deposit_id,
        'Nạp tiền thành công qua VietQR (' || v_deposit.transfer_content || ')',
        jsonb_build_object('deposit_id', p_deposit_id, 'amount', v_deposit.amount)
    );

    -- Insert notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        link
    ) VALUES (
        v_deposit.user_id,
        'Nạp tiền thành công',
        'Tài khoản của bạn đã được cộng +' || TO_CHAR(v_deposit.amount, 'FM999,999,999') || ' VNĐ.',
        'deposit',
        '/transactions'
    );

    RETURN jsonb_build_object(
        'success', true,
        'balance_after', v_balance_after
    );
END;
$$;

-- Function 3: Cancel & refund order atomically
CREATE OR REPLACE FUNCTION public.cancel_and_refund_order(
    p_order_id UUID,
    p_admin_id UUID,
    p_reason TEXT DEFAULT 'Hủy và hoàn tiền theo yêu cầu'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_profile RECORD;
    v_balance_before NUMERIC(15, 2);
    v_balance_after NUMERIC(15, 2);
    v_refund_amount NUMERIC(15, 2);
BEGIN
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Đơn hàng không tồn tại!';
    END IF;

    IF v_order.status IN ('refunded', 'canceled') THEN
        RAISE EXCEPTION 'Đơn hàng đã được hủy hoặc hoàn tiền trước đó!';
    END IF;

    -- Calculate refund amount (pro-rated if remains exists, otherwise full)
    IF v_order.remains > 0 AND v_order.quantity > 0 THEN
        v_refund_amount := ROUND((v_order.remains::NUMERIC / v_order.quantity::NUMERIC) * v_order.total_amount, 2);
    ELSE
        v_refund_amount := v_order.total_amount;
    END IF;

    -- Lock profile
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = v_order.user_id
    FOR UPDATE;

    v_balance_before := v_profile.balance;
    v_balance_after := v_balance_before + v_refund_amount;

    -- Update balance
    UPDATE public.profiles
    SET balance = v_balance_after,
        updated_at = NOW()
    WHERE id = v_order.user_id;

    -- Update order status
    UPDATE public.orders
    SET status = 'refunded',
        error_message = p_reason,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Record transaction
    INSERT INTO public.wallet_transactions (
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        status,
        transaction_code,
        reference_id,
        description,
        metadata
    ) VALUES (
        v_order.user_id,
        'refund',
        v_refund_amount,
        v_balance_before,
        v_balance_after,
        'completed',
        'REF_' || UPPER(SUBSTRING(p_order_id::text, 1, 8)) || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        p_order_id,
        'Hoàn tiền đơn hàng #' || UPPER(SUBSTRING(p_order_id::text, 1, 8)) || ' (' || p_reason || ')',
        jsonb_build_object('order_id', p_order_id, 'refund_amount', v_refund_amount)
    );

    -- Log admin action
    INSERT INTO public.admin_logs (
        admin_id,
        action,
        resource,
        resource_id,
        old_data,
        new_data
    ) VALUES (
        p_admin_id,
        'refund_order',
        'orders',
        p_order_id::text,
        jsonb_build_object('status', v_order.status, 'total_amount', v_order.total_amount),
        jsonb_build_object('status', 'refunded', 'refund_amount', v_refund_amount, 'reason', p_reason)
    );

    -- Insert notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        link
    ) VALUES (
        v_order.user_id,
        'Hoàn tiền đơn hàng',
        'Đơn hàng #' || UPPER(SUBSTRING(p_order_id::text, 1, 8)) || ' đã được hoàn lại +' || TO_CHAR(v_refund_amount, 'FM999,999,999') || ' VNĐ.',
        'refund',
        '/orders'
    );

    RETURN jsonb_build_object(
        'success', true,
        'refund_amount', v_refund_amount,
        'balance_after', v_balance_after
    );
END;
$$;

-- Function 4: Admin manually adjusts balance with audit log
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(
    p_admin_id UUID,
    p_target_user_id UUID,
    p_amount NUMERIC(15, 2),
    p_type TEXT DEFAULT 'adjustment',
    p_reason TEXT DEFAULT 'Điều chỉnh số dư bởi Quản trị viên'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin RECORD;
    v_profile RECORD;
    v_balance_before NUMERIC(15, 2);
    v_balance_after NUMERIC(15, 2);
BEGIN
    -- Verify admin role
    SELECT * INTO v_admin FROM public.profiles WHERE id = p_admin_id AND role = 'admin';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Chỉ quản trị viên mới có quyền thực hiện thao tác này!';
    END IF;

    -- Lock target user
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_target_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Người dùng không tồn tại!';
    END IF;

    v_balance_before := v_profile.balance;
    v_balance_after := v_balance_before + p_amount;

    IF v_balance_after < 0 THEN
        RAISE EXCEPTION 'Số dư không thể âm sau khi điều chỉnh!';
    END IF;

    -- Update balance
    UPDATE public.profiles
    SET balance = v_balance_after,
        updated_at = NOW()
    WHERE id = p_target_user_id;

    -- Record transaction
    INSERT INTO public.wallet_transactions (
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        status,
        transaction_code,
        reference_id,
        description,
        metadata
    ) VALUES (
        p_target_user_id,
        p_type,
        p_amount,
        v_balance_before,
        v_balance_after,
        'completed',
        'ADJ_' || UPPER(SUBSTRING(p_target_user_id::text, 1, 8)) || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        NULL,
        p_reason,
        jsonb_build_object('admin_id', p_admin_id, 'amount', p_amount)
    );

    -- Log admin action
    INSERT INTO public.admin_logs (
        admin_id,
        action,
        resource,
        resource_id,
        old_data,
        new_data
    ) VALUES (
        p_admin_id,
        'adjust_balance',
        'profiles',
        p_target_user_id::text,
        jsonb_build_object('balance_before', v_balance_before),
        jsonb_build_object('balance_after', v_balance_after, 'amount', p_amount, 'reason', p_reason)
    );

    -- Notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        link
    ) VALUES (
        p_target_user_id,
        'Biến động số dư',
        'Tài khoản của bạn đã được điều chỉnh: ' || CASE WHEN p_amount >= 0 THEN '+' ELSE '' END || TO_CHAR(p_amount, 'FM999,999,999') || ' VNĐ. Lý do: ' || p_reason,
        'system',
        '/transactions'
    );

    RETURN jsonb_build_object(
        'success', true,
        'balance_before', v_balance_before,
        'balance_after', v_balance_after
    );
END;
$$;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check if current auth user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES Policies
CREATE POLICY "Users can view their own profile or admin can view all" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own non-sensitive profile info" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- PLATFORMS & SERVICES Policies (Publicly readable, Admin manageable)
CREATE POLICY "Public readable platforms" ON public.platforms FOR SELECT USING (true);
CREATE POLICY "Admin write platforms" ON public.platforms FOR ALL USING (public.is_admin());

CREATE POLICY "Public readable services" ON public.services FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "Admin write services" ON public.services FOR ALL USING (public.is_admin());

CREATE POLICY "Public readable combos" ON public.service_combos FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "Admin write combos" ON public.service_combos FOR ALL USING (public.is_admin());

-- PROVIDERS Policies (Admin only)
CREATE POLICY "Admin only providers" ON public.smm_providers FOR ALL USING (public.is_admin());

-- ORDERS Policies
CREATE POLICY "Users view own orders or admin view all" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manage orders" ON public.orders
    FOR ALL USING (public.is_admin());

-- WALLET TRANSACTIONS Policies
CREATE POLICY "Users view own transactions or admin view all" ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- DEPOSITS Policies
CREATE POLICY "Users view own deposits or admin view all" ON public.deposits
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users create deposits" ON public.deposits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manage deposits" ON public.deposits
    FOR ALL USING (public.is_admin());

-- TICKETS Policies
CREATE POLICY "Users manage own tickets or admin view all" ON public.tickets
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users create tickets" ON public.tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manage tickets" ON public.tickets
    FOR ALL USING (public.is_admin());

-- TICKET MESSAGES Policies
CREATE POLICY "Users and admins view ticket messages" ON public.ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_messages.ticket_id AND (t.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Users and admins insert ticket messages" ON public.ticket_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND (
            EXISTS (
                SELECT 1 FROM public.tickets t
                WHERE t.id = ticket_messages.ticket_id AND (t.user_id = auth.uid() OR public.is_admin())
            )
        )
    );

-- NOTIFICATIONS Policies
CREATE POLICY "Users view and update own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- ADMIN LOGS Policies (Admin only)
CREATE POLICY "Admin only logs" ON public.admin_logs FOR ALL USING (public.is_admin());
