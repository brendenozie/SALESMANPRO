
import { useStateContext } from "../../../contexts/ContextProvider";
import { useState } from "react";

const Checkout = () => {
  const { cart, clearCart } = useStateContext();
  const [customerDetails, setCustomerDetails] = useState({ name: "", email: "" });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleOrder = () => {
    if (!customerDetails.name || !customerDetails.email) {
      alert("Please fill in all details.");
      return;
    }

    // Simulate an order submission (In real case, send data to a backend)
    setTimeout(() => {
      setOrderPlaced(true);
      clearCart();
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>

      {orderPlaced ? (
        <p className="text-green-500 text-lg font-bold">Order placed successfully! 🎉</p>
      ) : (
        <>
          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              <div className="border-b pb-4 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between py-2">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block font-medium">Name:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium">Email:</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-lg"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                />
              </div>

              <button
                onClick={handleOrder}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 transition"
              >
                Place Order
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Checkout;
