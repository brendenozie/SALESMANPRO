import { useState } from "react";
import { useStateContext } from "../../../contexts/ContextProvider";

const Checkout = () => {
  const { cart, clearCart } = useStateContext();
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    mobile: "",
    email: "",
    cardName: "",
    cardNumber: ""
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [returningCustomer, setReturningCustomer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const handleOrder = () => {
    if (!customerDetails.firstName || !customerDetails.email) {
      alert("Please fill in all required details.");
      return;
    }
    setTimeout(() => {
      setOrderPlaced(true);
      clearCart();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
      {orderPlaced ? (
        <p className="text-green-500 text-lg font-bold">Order placed successfully! 🎉</p>
      ) : (
        <>
          <div>
            <h2 className="text-xl font-semibold mb-4">Review Item And Shipping</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4 mb-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-500">Color: {item.color}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                    <p className="text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))
            )}
            <label className="flex items-center cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={returningCustomer}
                onChange={() => setReturningCustomer(!returningCustomer)}
                className="mr-2"
              />
              Returning Customer?
            </label>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Delivery Information</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <input type="text" placeholder="First Name" className="p-2 border rounded" />
                <input type="text" placeholder="Last Name" className="p-2 border rounded" />
                <input type="text" placeholder="Address" className="p-2 border rounded col-span-2" />
                <input type="text" placeholder="City" className="p-2 border rounded" />
                <input type="text" placeholder="Zip Code" className="p-2 border rounded" />
                <input type="text" placeholder="Mobile" className="p-2 border rounded" />
                <input type="email" placeholder="Email" className="p-2 border rounded" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
            <input type="text" placeholder="Enter Coupon Code" className="w-full p-2 border rounded mb-2" />
            <button className="w-full bg-green-600 text-white p-2 rounded mb-4">Apply Coupon</button>
            
            <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mr-2" />
                Cash on Delivery
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === "shopcard"} onChange={() => setPaymentMethod("shopcard")} className="mr-2" />
                Shopcart Card
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} className="mr-2" />
                Paypal
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === "credit"} onChange={() => setPaymentMethod("credit")} className="mr-2" />
                Credit or Debit Card
              </label>
            </div>
            {paymentMethod === "credit" && (
              <div className="mt-4">
                <input type="text" placeholder="Card Holder Name" className="w-full p-2 border rounded mb-2" />
                <input type="text" placeholder="Card Number" className="w-full p-2 border rounded mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Expiry" className="p-2 border rounded" />
                  <input type="text" placeholder="CVC" className="p-2 border rounded" />
                </div>
              </div>
            )}
            <button onClick={handleOrder} className="w-full bg-green-600 text-white p-2 rounded mt-4">
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Checkout;
