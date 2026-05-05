import Stripe from "stripe";

export const metadata = {
  title: "Transactions | Admin Dashboard",
  description: "View all transactions in DataProFlow.",
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function TransactionsPage() {
  let transactions: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    customer_email: string;
    customer_name: string | null;
    description: string | null;
  }> = [];

  let totalRevenue = 0;

  try {
    const charges = await stripe.charges.list({ limit: 100 });
    transactions = charges.data.map((charge) => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      created: charge.created,
      customer_email: charge.billing_details?.email || "",
      customer_name: charge.billing_details?.name || null,
      description: charge.description,
    }));

    totalRevenue = charges.data
      .filter((c) => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0);
  } catch (error) {
    console.error("Error fetching Stripe transactions:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-1">
            View all payment transactions from Stripe
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4">
          <p className="text-sm text-green-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-700">
            ${(totalRevenue / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-mono text-gray-900">{tx.id.slice(0, 20)}...</p>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {tx.customer_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">{tx.customer_email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">
                    ${(tx.amount / 100).toFixed(2)} {tx.currency.toUpperCase()}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tx.status === "succeeded"
                        ? "bg-green-100 text-green-700"
                        : tx.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(tx.created * 1000).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
