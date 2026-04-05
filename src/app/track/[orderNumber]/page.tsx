import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?user=postgres.doklwobzhcahpzbonhes&password=vRB3UAEfjS4wIxTM",
  ssl: { rejectUnauthorized: false },
});

export const dynamic = 'force-dynamic';

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
}

export async function generateStaticParams() {
  return [];
}

export default async function TrackOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;

  let order: any = null;
  let product: any = null;
  let customer: any = null;

  try {
    const orderResult = await pool.query(
      `SELECT o.*, c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.order_number = $1`,
      [orderNumber]
    );

    if (orderResult.rows.length > 0) {
      order = orderResult.rows[0];
      
      const productResult = await pool.query(
        `SELECT * FROM products WHERE id = $1`,
        [order.product_id]
      );
      product = productResult.rows[0];
      
      customer = {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
      };
    }
  } catch (err) {
    console.error('Error fetching order:', err);
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500',
      CONFIRMED: 'bg-blue-500',
      PROCESSING: 'bg-purple-500',
      SHIPPED: 'bg-indigo-500',
      DELIVERED: 'bg-green-500',
      CANCELLED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusStep = (status: string) => {
    const steps: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
      CANCELLED: -1,
    };
    return steps[status] ?? 0;
  };

  const currentStep = order ? getStatusStep(order.status) : -1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-white/8 py-4 lg:py-6">
        <div className="max-w-4xl mx-auto px-3 lg:px-4 flex items-center justify-between">
          <a href="/" className="text-xl lg:text-2xl font-bold tracking-[0.15em] text-white">
            NIRVAAH<span className="text-[#cfa15f]">.</span>
          </a>
          <a href="/" className="text-xs lg:text-sm text-[#cfa15f] hover:underline">
            Back to Home
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 lg:px-4 py-8 lg:py-12">
        {!order ? (
          <div className="text-center py-12 lg:py-20">
            <div className="w-16 lg:w-20 h-16 lg:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <svg className="w-8 lg:w-10 h-8 lg:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-white/60 text-sm lg:text-base mb-6 lg:mb-8">We couldn't find an order with this ID.</p>
            <p className="text-white/40 text-xs lg:text-sm">Please check your order number and try again.</p>
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-8">
            {/* Order Header */}
            <div className="text-center">
              <div className={`inline-block px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-bold mb-3 lg:mb-4 ${getStatusColor(order.status)} text-white`}>
                {order.status}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Order #{order.order_number}</h1>
              <p className="text-white/60 text-sm lg:text-base">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                })}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="bg-[#111] border border-white/8 rounded-xl lg:rounded-2xl p-4 lg:p-8 overflow-x-auto">
              <h2 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6">Order Timeline</h2>
              <div className="flex items-center justify-between min-w-[500px]">
                {['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                  const isCompleted = currentStep > index;
                  const isCurrent = currentStep === index;
                  
                  return (
                    <div key={step} className="flex flex-col items-center flex-1 relative">
                      {index > 0 && (
                        <div className={`absolute top-5 -left-1/2 w-full h-0.5 ${isCompleted ? 'bg-[#cfa15f]' : 'bg-white/10'}`} />
                      )}
                      <div className={`w-8 lg:w-10 h-8 lg:h-10 rounded-full flex items-center justify-center relative z-10 ${
                        isCompleted ? 'bg-[#cfa15f]' : isCurrent ? 'bg-[#cfa15f] animate-pulse' : 'bg-white/10'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-4 lg:w-5 h-4 lg:h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className={`text-xs lg:text-sm font-bold ${isCurrent ? 'text-black' : 'text-white/40'}`}>{index + 1}</span>
                        )}
                      </div>
                      <span className={`mt-1.5 lg:mt-2 text-[10px] lg:text-xs ${isCompleted || isCurrent ? 'text-white' : 'text-white/40'}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Product Info */}
              <div className="bg-[#111] border border-white/8 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <h3 className="text-xs lg:text-sm font-semibold text-[#cfa15f] uppercase tracking-wider mb-3 lg:mb-4">Product Details</h3>
                {product && (
                  <div className="space-y-2 lg:space-y-3">
                    <div className="text-base lg:text-lg font-medium">{product.name}</div>
                    {product.description && (
                      <p className="text-white/60 text-xs lg:text-sm">{product.description}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="bg-[#111] border border-white/8 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <h3 className="text-xs lg:text-sm font-semibold text-[#cfa15f] uppercase tracking-wider mb-3 lg:mb-4">Payment Details</h3>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60 text-xs lg:text-sm">Token Paid</span>
                    <span className="font-semibold text-[#cfa15f] text-xs lg:text-sm">₹{parsePrice(order.token_amount || '199').toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-xs lg:text-sm">Total Amount</span>
                    <span className="font-semibold text-xs lg:text-sm">₹{parsePrice(order.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-xs lg:text-sm">Balance to Pay</span>
                    <span className="font-semibold text-yellow-400 text-xs lg:text-sm">₹{(parsePrice(order.total_amount) - parsePrice(order.token_amount || '199')).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white/60 text-xs lg:text-sm">Payment Status</span>
                    <span className={`font-semibold text-xs lg:text-sm ${order.token_paid ? 'text-green-400' : 'text-yellow-400'}`}>
                      {order.token_paid ? 'Token Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-[#111] border border-white/8 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <h3 className="text-xs lg:text-sm font-semibold text-[#cfa15f] uppercase tracking-wider mb-3 lg:mb-4">Shipping Address</h3>
                <div className="space-y-2">
                  <div className="font-medium text-sm">{customer?.name || 'N/A'}</div>
                  {order.shipping_address && (
                    <p className="text-white/60 text-xs lg:text-sm whitespace-pre-line">{order.shipping_address}</p>
                  )}
                  {customer?.phone && (
                    <p className="text-white/60 text-xs lg:text-sm">📞 {customer.phone}</p>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-[#111] border border-white/8 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <h3 className="text-xs lg:text-sm font-semibold text-[#cfa15f] uppercase tracking-wider mb-3 lg:mb-4">Delivery</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60 text-xs lg:text-sm">Estimated Delivery</span>
                    <span className="font-medium text-xs lg:text-sm">5-7 business days</span>
                  </div>
                  {order.tracking_number && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-xs lg:text-sm">Tracking</span>
                      <span className="font-medium text-xs lg:text-sm">{order.tracking_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-[#111] border border-white/8 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center">
              <h3 className="font-semibold text-sm lg:text-base mb-1 lg:mb-2">Need Help?</h3>
              <p className="text-white/60 text-xs lg:text-sm mb-3 lg:mb-4">Contact us for any questions about your order</p>
              <a href="mailto:nirvaahlifestyle@gmail.com" className="text-[#cfa15f] hover:underline text-xs lg:text-sm">
                nirvaahlifestyle@gmail.com
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 py-6 lg:py-8 mt-8 lg:mt-12">
        <div className="max-w-4xl mx-auto px-3 lg:px-4 text-center text-white/40 text-xs lg:text-sm">
          <p>© 2026 Nirvaah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}