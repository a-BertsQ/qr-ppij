interface ResetPasswordEmailProps {
    name: string
    resetUrl: string
  }
  
  export function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ color: "#333", textAlign: "center" }}>Reset Your Password</h1>
        <p>Hello {name},</p>
        <p>
          We received a request to reset your password. If you didn&apos;t make this request, you can safely ignore this email.
        </p>
        <p>To reset your password, click the button below:</p>
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a
            href={resetUrl}
            style={{
              backgroundColor: "#0070f3",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this URL into your browser:</p>
        <p style={{ wordBreak: "break-all", color: "#0070f3" }}>{resetUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Thank you,</p>
        <p>QR Code Generator Team</p>
      </div>
    )
  }
  
  