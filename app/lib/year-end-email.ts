import { YEAR_END_EVENT_CONFIG } from "./year-end-constants";
import { calculateAge, capitalizeWords } from "./year-end-fee";

export interface YearEndEmailRegistrationData {
  registrationId: string;
  primaryContactName: string;
  email: string;
  countryCode: string;
  contactNumber: string;
  secondaryCountryCode?: string | null;
  secondaryContactNumber?: string | null;
  notes?: string | null;
  ticketDetails: any;
  totalAttendees: number;
  subtotal: any;
  processingFee: any;
  totalAmount: any;
  paymentStatus: string;
}

function getSiteUrl(): string {
  return (
    process.env.LIVE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://thewolverines.ca"
  ).replace(/\/$/, "");
}

function getLogoUrl(): string {
  const siteUrl = getSiteUrl();
  return (
    process.env.WOLVERINES_EMAIL_LOGO_URL ||
    `${siteUrl}/images/logo.png`
  );
}

function getAdminEmails(): string[] {
  const envVal = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!envVal) return ["thewolverinesfhc@gmail.com"];
  return envVal
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export interface EmailAttendee {
  name: string;
  dateOfBirth?: string;
  age?: number;
  categoryLabel?: string;
  price?: number;
}

export function extractAttendees(
  ticketDetails: any,
  primaryName?: string,
): EmailAttendee[] {
  const details = ticketDetails || {};

  // 1. Structured attendees array (current standard)
  if (Array.isArray(details.attendees) && details.attendees.length > 0) {
    return details.attendees.map((att: any) => {
      const parsedAge =
        typeof att.age === "number"
          ? att.age
          : att.dateOfBirth
          ? calculateAge(att.dateOfBirth) ?? undefined
          : undefined;
      return {
        name: capitalizeWords(att.name) || "Unnamed Attendee",
        dateOfBirth: att.dateOfBirth || "",
        age: parsedAge,
        categoryLabel: att.categoryLabel || "",
        price: typeof att.price === "number" ? att.price : undefined,
      };
    });
  }

  // 2. Family members array
  if (Array.isArray(details.familyMembers) && details.familyMembers.length > 0) {
    return details.familyMembers.map((m: any) => {
      if (typeof m === "string") {
        const match = m.match(/^(.*?)(?:\s*\(([\d\-]+)(?:,\s*Age:\s*(\d+))?\))?$/);
        if (match) {
          const dob = match[2]?.trim() || "";
          const parsedAge = match[3]
            ? parseInt(match[3], 10)
            : dob
            ? calculateAge(dob) ?? undefined
            : undefined;
          return {
            name: capitalizeWords(match[1]?.trim() || m),
            dateOfBirth: dob,
            age: parsedAge,
          };
        }
        return { name: capitalizeWords(m), dateOfBirth: "" };
      }
      const parsedAge =
        typeof m.age === "number"
          ? m.age
          : m.dateOfBirth
          ? calculateAge(m.dateOfBirth) ?? undefined
          : undefined;
      return {
        name: capitalizeWords(m.name) || "Family Member",
        dateOfBirth: m.dateOfBirth || "",
        age: parsedAge,
        categoryLabel: m.categoryLabel,
        price: m.price,
      };
    });
  }

  // 3. Fallback to primary contact
  if (primaryName) {
    return [{ name: capitalizeWords(primaryName), dateOfBirth: "" }];
  }

  return [];
}

export async function sendYearEndParentConfirmation(
  data: YearEndEmailRegistrationData,
) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "The Wolverines";

  if (!apiKey || !senderEmail) {
    console.warn("Brevo API key or sender email not configured. Skipping confirmation email.");
    return;
  }

  const siteUrl = getSiteUrl();
  const logoUrl = getLogoUrl();

  const details = data.ticketDetails || {};
  const attendees = extractAttendees(details, data.primaryContactName);
  const under5Qty = details.under5?.quantity || 0;
  const child5to10Qty = details.child5to10?.quantity || 0;
  const ages11PlusQty = details.ages11Plus?.quantity || 0;
  const familyOf4Qty = details.familyOf4?.quantity || 0;
  const familyOf5Qty = details.familyOf5?.quantity || 0;
  // Fallbacks for legacy records
  const legacyIndQty = details.individual?.quantity || 0;
  const legacyFamQty = details.family?.quantity || 0;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Registration Confirmation - ${YEAR_END_EVENT_CONFIG.eventName}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial,Helvetica,sans-serif; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.06);">
          <!-- Header with Logo -->
          <tr>
            <td style="background-color:#D9001B; padding:28px 30px 22px; text-align:center;">
              <a href="${siteUrl}" target="_blank" style="display:inline-block; text-decoration:none;">
                <img
                  src="${logoUrl}"
                  alt="The Wolverines Field Hockey Club"
                  width="180"
                  style="display:block; margin:0 auto 14px auto; width:180px; max-width:100%; height:auto; border:0; outline:none;"
                />
              </a>
              <p style="color:#ffffff; margin:6px 0 0 0; font-size:14px; opacity:0.95;">
                ${YEAR_END_EVENT_CONFIG.eventName} Registration
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 30px;">
              <h2 style="margin:0 0 12px 0; font-size:20px; color:#111; text-transform:capitalize;">
                Hello ${capitalizeWords(data.primaryContactName)},
              </h2>
              <p style="margin:0 0 20px 0; font-size:15px; line-height:1.6; color:#555;">
                Thank you for registering for the <strong>${YEAR_END_EVENT_CONFIG.eventName}</strong>! Your registration and payment have been confirmed.
              </p>

              <!-- Reference Badge -->
              <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:24px; text-align:center;">
                <span style="font-size:12px; text-transform:uppercase; color:#64748b; font-weight:700; letter-spacing:1px;">Registration Reference ID</span>
                <div style="font-size:22px; font-weight:800; color:#D9001B; margin-top:4px; letter-spacing:1.5px;">
                  ${data.registrationId}
                </div>
              </div>

              <!-- Registered Family Members & Attendees Table -->
              ${attendees.length > 0 ? `
              <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:24px;">
                <h3 style="margin:0 0 12px 0; font-size:15px; color:#111; border-bottom:1px solid #e2e8f0; padding-bottom:6px; font-weight:700;">
                  Registered Family Members &amp; Attendees (${attendees.length})
                </h3>
                <table width="100%" cellpadding="8" cellspacing="0" style="font-size:13px; color:#333; border-collapse:collapse;">
                  <thead>
                    <tr style="background:#edf2f7; text-align:left; font-size:11px; color:#4a5568; text-transform:uppercase; letter-spacing:0.5px;">
                      <th style="padding:8px 10px; border:1px solid #e2e8f0; width:36px; text-align:center;">#</th>
                      <th style="padding:8px 12px; border:1px solid #e2e8f0;">Full Name</th>
                      <th style="padding:8px 12px; border:1px solid #e2e8f0; width:90px; text-align:center;">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${attendees.map((att, i) => `
                      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fcfcfc'};">
                        <td style="padding:8px 10px; border:1px solid #e2e8f0; font-weight:bold; text-align:center; color:#64748b; font-size:12px;">${i + 1}</td>
                        <td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700; color:#111827; text-transform:capitalize;">
                          ${capitalizeWords(att.name)} ${i === 0 ? '<span style="font-size:10px; color:#D9001B; font-weight:600; padding:1px 6px; background:#fee2e2; border-radius:3px; margin-left:6px; text-transform:none;">Primary</span>' : ''}
                        </td>
                        <td style="padding:8px 12px; border:1px solid #e2e8f0; text-align:center; font-weight:700; color:#111827;">
                          ${typeof att.age === "number" ? `${att.age} yrs` : '<span style="color:#94a3b8; font-style:italic; font-weight:normal;">N/A</span>'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              ` : ''}

              <!-- Ticket Summary Table -->
              <h3 style="margin:0 0 12px 0; font-size:16px; color:#111; border-bottom:2px solid #eee; padding-bottom:6px;">
                Ticket & Payment Breakdown
              </h3>
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px; color:#444; margin-bottom:20px;">
                ${under5Qty > 0
      ? `<tr><td>Children Under 5 &times; ${under5Qty}</td><td align="right" style="color:#16a34a; font-weight:bold;">FREE</td></tr>`
      : ""
    }
                ${child5to10Qty > 0
      ? `<tr><td>Children (Ages 5–10) &times; ${child5to10Qty}</td><td align="right">$${Number(details.child5to10?.subtotal || 0).toFixed(2)} CAD</td></tr>`
      : ""
    }
                ${ages11PlusQty > 0
      ? `<tr><td>Ages 11+ (Youth & Adults) &times; ${ages11PlusQty}</td><td align="right">$${Number(details.ages11Plus?.subtotal || 0).toFixed(2)} CAD</td></tr>`
      : ""
    }
                ${familyOf4Qty > 0
      ? `<tr><td>Family of 4 Package &times; ${familyOf4Qty}</td><td align="right">$${Number(details.familyOf4?.subtotal || 0).toFixed(2)} CAD</td></tr>`
      : ""
    }
                ${familyOf5Qty > 0
      ? `<tr><td>Family of 5 Package &times; ${familyOf5Qty}</td><td align="right">$${Number(details.familyOf5?.subtotal || 0).toFixed(2)} CAD</td></tr>`
      : ""
    }
                ${legacyIndQty > 0
      ? `<tr><td>Individual Ticket(s) &times; ${legacyIndQty}</td><td align="right">$${Number(details.individual?.subtotal || 0).toFixed(2)} CAD</td></tr>`
      : ""
    }
                ${legacyFamQty > 0
      ? `<tr><td>Family Package &times; ${legacyFamQty}</td><td align="right">$${Number(details.family?.subtotal || 0).toFixed(2)} CAD</td></tr>`
      : ""
    }
                <tr><td colspan="2"><hr style="border:none; border-top:1px solid #eee; margin:6px 0;" /></td></tr>
                <tr><td>Subtotal</td><td align="right">$${Number(data.subtotal || 0).toFixed(2)} CAD</td></tr>
                <tr><td>Online Processing Fee (3%)</td><td align="right">$${Number(data.processingFee || 0).toFixed(2)} CAD</td></tr>
                <tr style="font-size:16px; font-weight:bold; color:#111;">
                  <td>Total Paid</td>
                  <td align="right" style="color:#D9001B;">$${Number(data.totalAmount || 0).toFixed(2)} CAD</td>
                </tr>
              </table>

              <!-- Contact Info -->
              <div style="background-color:#fff7ed; border-left:4px solid #f97316; padding:12px 16px; border-radius:4px; font-size:13px; color:#9a3412;">
                <strong>Event Check-in:</strong> Please keep this email or note your Reference ID (<strong>${data.registrationId}</strong>) handy during event check-in.
              </div>

              <p style="margin:28px 0 0 0; font-size:14px; color:#666;">
                We look forward to celebrating an incredible year with you and the team!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb; padding:20px 30px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #eee;">
              The Wolverines Field Hockey Club &copy; ${YEAR_END_EVENT_CONFIG.eventYear}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const recipientEmail = (data.email || "").trim().toLowerCase();
  const recipientName =
    capitalizeWords(data.primaryContactName) || "Valued Registrant";

  if (!recipientEmail) {
    console.warn(
      `[sendYearEndParentConfirmation] Missing recipient email for registration ${data.registrationId}. Skipping.`,
    );
    return;
  }

  try {
    console.log(
      `[sendYearEndParentConfirmation] Dispatching confirmation email for ${data.registrationId} to ${recipientEmail}...`,
    );
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        replyTo: { name: senderName, email: "thewolverinesfhc@gmail.com" },
        to: [{ email: recipientEmail, name: recipientName }],
        subject: `Registration Confirmed: ${YEAR_END_EVENT_CONFIG.eventName} [${data.registrationId}]`,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(
        `[sendYearEndParentConfirmation] Brevo API Error (${res.status}) for ${recipientEmail}:`,
        err,
      );
    } else {
      const result = await res.json().catch(() => ({}));
      console.log(
        `[sendYearEndParentConfirmation] Successfully sent confirmation email to ${recipientEmail}! Message ID:`,
        result.messageId,
      );
    }
  } catch (err) {
    console.error(
      `[sendYearEndParentConfirmation] Network/execution error for ${recipientEmail}:`,
      err,
    );
  }
}

export async function sendYearEndAdminNotification(
  data: YearEndEmailRegistrationData,
) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "The Wolverines";

  if (!apiKey || !senderEmail) return;

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return;

  const siteUrl = getSiteUrl();
  const logoUrl = getLogoUrl();
  const details = data.ticketDetails || {};
  const attendees = extractAttendees(details, data.primaryContactName);
  const regType =
    details.registrationType || (attendees.length > 1 ? "FAMILY" : "INDIVIDUAL");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Registration - ${YEAR_END_EVENT_CONFIG.eventName}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial,Helvetica,sans-serif; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.06); border:1px solid #e5e7eb;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color:#111827; padding:24px 30px; text-align:center; border-bottom:3px solid #D9001B;">
              <a href="${siteUrl}" target="_blank" style="display:inline-block; text-decoration:none;">
                <img
                  src="${logoUrl}"
                  alt="The Wolverines Field Hockey Club"
                  width="160"
                  style="display:block; margin:0 auto 10px auto; width:160px; max-width:100%; height:auto; border:0;"
                />
              </a>
              <h2 style="color:#ffffff; margin:0; font-size:18px; font-weight:700; letter-spacing:0.5px;">
                New Registration: ${YEAR_END_EVENT_CONFIG.eventName}
              </h2>
              <p style="color:#9ca3af; margin:4px 0 0 0; font-size:13px;">
                Internal Admin Notification Alert
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 30px;">
              
              <!-- Quick Overview Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:14px 18px; margin-bottom:22px;">
                <tr>
                  <td align="left">
                    <span style="font-size:11px; text-transform:uppercase; color:#991b1b; font-weight:700; letter-spacing:0.8px;">Registration ID</span>
                    <div style="font-size:20px; font-weight:800; color:#D9001B; font-family:monospace; margin-top:2px;">
                      ${data.registrationId}
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-size:11px; text-transform:uppercase; color:#6b7280; font-weight:700;">Total Amount</span>
                    <div style="font-size:20px; font-weight:800; color:#111827; margin-top:2px;">
                      $${Number(data.totalAmount).toFixed(2)} CAD
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Primary Contact Information -->
              <h3 style="margin:0 0 10px 0; font-size:13px; text-transform:uppercase; color:#6b7280; letter-spacing:0.8px; border-bottom:1px solid #e5e7eb; padding-bottom:6px;">
                Primary Contact Information
              </h3>
              <table width="100%" cellpadding="5" cellspacing="0" style="font-size:13px; color:#374151; margin-bottom:22px;">
                <tr>
                  <td width="35%" style="color:#6b7280; font-weight:600;">Contact Name:</td>
                  <td style="font-weight:700; color:#111827; text-transform:capitalize;">${capitalizeWords(data.primaryContactName)}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280; font-weight:600;">Email Address:</td>
                  <td><a href="mailto:${data.email}" style="color:#D9001B; text-decoration:none; font-weight:600;">${data.email}</a></td>
                </tr>
                <tr>
                  <td style="color:#6b7280; font-weight:600;">Primary Phone:</td>
                  <td>${data.countryCode} ${data.contactNumber}</td>
                </tr>
                ${data.secondaryContactNumber ? `
                <tr>
                  <td style="color:#6b7280; font-weight:600;">Secondary Phone:</td>
                  <td>${data.secondaryCountryCode || ""} ${data.secondaryContactNumber}</td>
                </tr>` : ""}
                <tr>
                  <td style="color:#6b7280; font-weight:600;">Registration Type:</td>
                  <td>
                    <span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; ${regType === "FAMILY" ? "background:#f3e8ff; color:#7e22ce;" : "background:#e0f2fe; color:#0369a1;"}">
                      ${regType === "FAMILY" ? "Family Package" : "Individual Ticket"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280; font-weight:600;">Total Attendees:</td>
                  <td style="font-weight:700; color:#111827;">${data.totalAttendees}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280; font-weight:600;">Payment Status:</td>
                  <td>
                    <span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; background:#dcfce7; color:#15803d;">
                      ${data.paymentStatus || "PAID"}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Family Members & Attendees (Name & Date of Birth) -->
              <h3 style="margin:0 0 10px 0; font-size:13px; text-transform:uppercase; color:#6b7280; letter-spacing:0.8px; border-bottom:1px solid #e5e7eb; padding-bottom:6px;">
                Registered Attendees & Family Members (${attendees.length})
              </h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="font-size:13px; color:#374151; border-collapse:collapse; margin-bottom:22px; border:1px solid #e5e7eb; border-radius:6px; overflow:hidden;">
                <thead>
                  <tr style="background-color:#f9fafb; text-align:left; font-size:11px; color:#4b5563; text-transform:uppercase; letter-spacing:0.5px;">
                    <th style="padding:8px 10px; border-bottom:1px solid #e5e7eb; width:28px; text-align:center;">#</th>
                    <th style="padding:8px 10px; border-bottom:1px solid #e5e7eb;">Full Name</th>
                    <th style="padding:8px 10px; border-bottom:1px solid #e5e7eb;">Date of Birth (DOB)</th>
                    <th style="padding:8px 10px; border-bottom:1px solid #e5e7eb;">Age / Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  ${attendees.map((att, idx) => `
                    <tr style="background-color:${idx % 2 === 0 ? "#ffffff" : "#fcfcfc"}; border-bottom:1px solid #f3f4f6;">
                      <td style="padding:8px 10px; font-weight:bold; text-align:center; color:#9ca3af; font-size:12px;">
                        ${idx + 1}
                      </td>
                      <td style="padding:8px 10px; font-weight:700; color:#111827; text-transform:capitalize;">
                        ${capitalizeWords(att.name)}
                        ${idx === 0 ? '<span style="margin-left:6px; font-size:10px; font-weight:600; padding:1px 6px; background:#fee2e2; color:#b91c1c; border-radius:3px; text-transform:none;">Primary</span>' : ''}
                      </td>
                      <td style="padding:8px 10px; font-family:monospace; font-weight:700; color:#1f2937;">
                        ${att.dateOfBirth ? att.dateOfBirth : '<span style="color:#9ca3af; font-style:italic; font-weight:normal; font-family:Arial,sans-serif;">Not recorded</span>'}
                      </td>
                      <td style="padding:8px 10px; color:#4b5563;">
                        ${typeof att.age === "number" ? `<strong style="color:#111827;">${att.age} yrs</strong>` : ""}
                        ${att.categoryLabel ? `<span style="color:#6b7280; font-size:12px;"> (${att.categoryLabel})</span>` : ""}
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>

              <!-- Special Notes / Dietary -->
              ${data.notes ? `
                <div style="background-color:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:4px; font-size:13px; color:#92400e; margin-bottom:20px;">
                  <strong style="display:block; margin-bottom:4px; text-transform:uppercase; font-size:11px; letter-spacing:0.5px;">Special Notes / Dietary Requirements:</strong>
                  ${data.notes}
                </div>
              ` : ""}

              <!-- Footer action link -->
              <div style="font-size:12px; color:#9ca3af; border-top:1px solid #f3f4f6; padding-top:14px;">
                View complete records and download attendee spreadsheets in the <a href="${siteUrl}/admin/event-registrations" target="_blank" style="color:#D9001B; text-decoration:none; font-weight:bold;">Admin Portal &rarr;</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb; padding:16px 30px; text-align:center; font-size:11px; color:#9ca3af; border-top:1px solid #e5e7eb;">
              The Wolverines Field Hockey Club &copy; ${YEAR_END_EVENT_CONFIG.eventYear}. Confidential Admin Notification.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    console.log(
      `[sendYearEndAdminNotification] Dispatching admin notification for ${data.registrationId} to ${adminEmails.join(", ")}...`,
    );
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        replyTo: { name: senderName, email: "thewolverinesfhc@gmail.com" },
        to: adminEmails.map((e) => ({ email: e.trim().toLowerCase() })),
        subject: `[New Registration] ${YEAR_END_EVENT_CONFIG.eventName} - ${capitalizeWords(data.primaryContactName)} (${attendees.length} Attendees - $${Number(data.totalAmount).toFixed(2)})`,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(
        `[sendYearEndAdminNotification] Brevo API Error (${res.status}):`,
        err,
      );
    } else {
      const result = await res.json().catch(() => ({}));
      console.log(
        `[sendYearEndAdminNotification] Successfully sent admin notification! Message ID:`,
        result.messageId,
      );
    }
  } catch (err) {
    console.error(
      `[sendYearEndAdminNotification] Network/execution error:`,
      err,
    );
  }
}
