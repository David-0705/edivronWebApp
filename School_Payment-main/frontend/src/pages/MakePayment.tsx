import React, { useState } from "react";

interface PaymentData {
  school_id: string;
  trustee_id: string;
  student_info: {
    name: string;
    id: string;
    email: string;
  };
  amount: number;
  gateway_name: string;
  description: string;
}

const MakePayment: React.FC = () => {
  const [formData, setFormData] = useState<PaymentData>({
    school_id: "65b0e6293e9f76a9694d84b4", // Valid EDVIRON school_id
    trustee_id: "65b0e552dd31950a9b41c5ba", // Valid EDVIRON trustee_id from API key
    student_info: {
      name: "",
      id: "",
      email: "",
    },
    amount: 0,
    gateway_name: "edviron",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("student_")) {
      const studentField = name.replace("student_", "");
      setFormData({
        ...formData,
        student_info: {
          ...formData.student_info,
          [studentField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === "amount" ? parseFloat(value) || 0 : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (formData.amount <= 0) {
      setError("Amount must be greater than 0");
      setIsLoading(false);
      return;
    }

    if (!formData.student_info.email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Use EDVIRON endpoint
      const API_URL = import.meta.env.VITE_API_URL;
      const endpoint = `${API_URL}/create-payment`;

      console.log(`Creating ${formData.gateway_name} payment with data:`, {
        ...formData,
        student_info: {
          ...formData.student_info,
          email: formData.student_info.email
            ? "[EMAIL_PROVIDED]"
            : "[NO_EMAIL]",
        },
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Payment creation response:", {
        status: response.status,
        data,
      });

      if (response.ok) {
        setSuccess(true);
        // Handle different response formats
        const paymentUrl =
          data.payment_url || data.paymentUrl || data.payment_link || "";
        console.log("Payment URL extracted:", paymentUrl);
        setPaymentUrl(paymentUrl);

        // Auto-redirect to payment URL after 3 seconds (give user time to see success message)
        if (paymentUrl) {
          console.log("Setting up auto-redirect in 3 seconds...");
          setTimeout(() => {
            console.log("Redirecting to payment URL:", paymentUrl);
            window.location.href = paymentUrl;
          }, 3000);
        } else {
          console.warn("No payment URL found in response");
          setError(
            "Payment created but no payment URL received. Please contact support."
          );
        }
      } else {
        console.error("Payment creation failed:", {
          status: response.status,
          data,
        });
        const errorMessage =
          data.message ||
          data.error ||
          `Payment creation failed (Status: ${response.status})`;
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error("Payment creation error:", err);
      let errorMessage = "Payment creation failed. Please try again.";

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage =
          "Unable to connect to payment server. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = `Payment creation failed: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      school_id: "65b0e6293e9f76a9694d84b4", // Valid EDVIRON school_id
      trustee_id: "65b0e552dd31950a9b41c5ba", // Valid EDVIRON trustee_id from API key
      student_info: {
        name: "",
        id: "",
        email: "",
      },
      amount: 0,
      gateway_name: "edviron",
      description: "",
    });
    setSuccess(false);
    setPaymentUrl("");
    setError("");
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full">
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center animate-fade-in">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-2 drop-shadow-lg animate-fade-in">
              Payment Created Successfully!
            </h1>
            <p className="mt-2 text-base text-white/80 animate-fade-in">
              Your payment request has been created. Redirecting to payment page
              in 3 seconds...
            </p>
            <div className="bg-green-100 border border-green-200 rounded-xl p-6 mt-6 animate-fade-in">
              <h3 className="text-lg font-bold text-green-800 mb-2">
                Payment Details
              </h3>
              <div className="text-green-700 space-y-1">
                <p>
                  <strong>Student:</strong> {formData.student_info.name}
                </p>
                <p>
                  <strong>Amount:</strong> ₹{formData.amount}
                </p>
                <p>
                  <strong>Description:</strong> {formData.description}
                </p>
                <p>
                  <strong>Gateway:</strong> {formData.gateway_name}
                </p>
              </div>
              {paymentUrl && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => (window.location.href = paymentUrl)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-500 to-indigo-500 shadow-lg hover:scale-105 transition-transform duration-200"
                  >
                    Pay Now
                    <svg
                      className="ml-2 -mr-1 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                  <p className="text-xs text-green-700">
                    Or wait for automatic redirect in 3 seconds...
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleReset}
              className="mt-8 inline-flex items-center px-6 py-3 border border-white/40 shadow-lg text-base font-semibold rounded-xl text-indigo-700 bg-white/70 hover:bg-white/90 hover:text-pink-500 transition-colors duration-200"
            >
              Create Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-2 drop-shadow-lg animate-fade-in">
            Create Payment
          </h1>
          <p className="mt-2 text-base text-white/80 animate-fade-in">
            Create a new payment request for school fees and other educational
            expenses.
          </p>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 mt-6 animate-fade-in"
          >
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
                <h3 className="text-sm font-bold mb-1">Payment Error</h3>
                <p className="text-sm">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  If this issue persists, please contact support or try using a
                  different payment gateway.
                </p>
              </div>
            )}
            {/* School Information */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                School Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="school_id"
                    className="block text-sm font-medium text-white/80"
                  >
                    School ID *
                  </label>
                  <input
                    type="text"
                    id="school_id"
                    name="school_id"
                    required
                    value={formData.school_id}
                    disabled
                    readOnly
                    className="mt-1 block w-full px-4 py-3 border border-white/40 rounded-xl shadow-sm bg-white/20 text-white/80 cursor-not-allowed focus:outline-none"
                    placeholder="School ID (System Generated)"
                  />
                </div>
                <div>
                  <label
                    htmlFor="trustee_id"
                    className="block text-sm font-medium text-white/80"
                  >
                    Trustee ID *
                  </label>
                  <input
                    type="text"
                    id="trustee_id"
                    name="trustee_id"
                    required
                    value={formData.trustee_id}
                    disabled
                    readOnly
                    className="mt-1 block w-full px-4 py-3 border border-white/40 rounded-xl shadow-sm bg-white/20 text-white/80 cursor-not-allowed focus:outline-none"
                    placeholder="Trustee ID (System Generated)"
                  />
                </div>
              </div>
            </div>
            {/* Student Information */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                Student Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="student_name"
                    className="block text-sm font-medium text-white/80"
                  >
                    Student Name *
                  </label>
                  <input
                    type="text"
                    id="student_name"
                    name="student_name"
                    required
                    value={formData.student_info.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-white/40 rounded-xl shadow-sm bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="student_id"
                    className="block text-sm font-medium text-white/80"
                  >
                    Student ID *
                  </label>
                  <input
                    type="text"
                    id="student_id"
                    name="student_id"
                    required
                    value={formData.student_info.id}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-white/40 rounded-xl shadow-sm bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    placeholder="Enter student ID"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="student_email"
                    className="block text-sm font-medium text-white/80"
                  >
                    Student Email *
                  </label>
                  <input
                    type="email"
                    id="student_email"
                    name="student_email"
                    required
                    value={formData.student_info.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-white/40 rounded-xl shadow-sm bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                    placeholder="Enter student email"
                  />
                </div>
              </div>
            </div>
            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                Payment Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-white/80"
                  >
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    required
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-white/40 rounded-xl shadow-sm bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gateway_name"
                    className="block text-sm font-medium text-white/80"
                  >
                    Payment Gateway
                  </label>
                  <div className="mt-1 px-4 py-3 border border-white/40 rounded-xl bg-white/20 text-white/80">
                    EDVIRON (Integrated Payment Gateway)
                  </div>
                  <input type="hidden" name="gateway_name" value="edviron" />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-white/80"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-white/40 rounded-xl shadow-sm bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                    placeholder="Enter payment description (e.g., School fee payment, Library fee, etc.)"
                  />
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-white/40 shadow-lg text-base font-semibold rounded-xl text-indigo-700 bg-white/70 hover:bg-white/90 hover:text-pink-500 transition-colors duration-200"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-3 px-6 border border-transparent shadow-lg text-base font-semibold rounded-xl text-white bg-gradient-to-r from-pink-500 to-indigo-500 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Payment..." : "Create Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;
