import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | The Wolverines Field Hockey Club",
  description: "Privacy Policy for The Wolverines Field Hockey Club.",
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
};

const textStyle: React.CSSProperties = {
  fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-white min-h-[70vh] py-10 sm:py-16">
      <h1 className="sr-only">Privacy Policy</h1>
      <div className="site-container">
        <div className="w-full" style={textStyle}>

          {/* WHO WE ARE */}
          <section className="mb-[35px]">
            <h2
              className="text-[30px] font-normal leading-tight text-[#181818] uppercase tracking-normal mb-2"
              style={headingStyle}
            >
              WHO WE ARE
            </h2>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              <strong className="font-bold text-[#181818]">Suggested text:</strong>{" "}
              Our website address is: https://thewolverines.ca.
            </p>
          </section>

          {/* COMMENTS */}
          <section className="mb-[35px]">
            <h2
              className="text-[30px] font-normal leading-tight text-[#181818] uppercase tracking-normal mb-2"
              style={headingStyle}
            >
              COMMENTS
            </h2>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              <strong className="font-bold text-[#181818]">Suggested text:</strong>{" "}
              When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor&apos;s IP address and browser user agent string to help spam detection.
            </p>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/. After approval of your comment, your profile picture is visible to the public in the context of your comment.
            </p>
          </section>

          {/* MEDIA */}
          <section className="mb-[35px]">
            <h2
              className="text-[30px] font-normal leading-tight text-[#181818] uppercase tracking-normal mb-2"
              style={headingStyle}
            >
              MEDIA
            </h2>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              <strong className="font-bold text-[#181818]">Suggested text:</strong>{" "}
              If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.
            </p>
          </section>

          {/* COOKIES */}
          <section className="mb-[35px]">
            <h2
              className="text-[30px] font-normal leading-tight text-[#181818] uppercase tracking-normal mb-2"
              style={headingStyle}
            >
              COOKIES
            </h2>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              <strong className="font-bold text-[#181818]">Suggested text:</strong>{" "}
              If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.
            </p>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.
            </p>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select &ldquo;Remember Me&rdquo;, your login will persist for two weeks. If you log out of your account, the login cookies will be removed.
            </p>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.
            </p>
          </section>

          {/* EMBEDDED CONTENT FROM OTHER WEBSITES */}
          <section className="mb-[35px]">
            <h2
              className="text-[30px] font-normal leading-tight text-[#181818] uppercase tracking-normal mb-2"
              style={headingStyle}
            >
              EMBEDDED CONTENT FROM OTHER WEBSITES
            </h2>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              <strong className="font-bold text-[#181818]">Suggested text:</strong>{" "}
              Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.
            </p>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.
            </p>
          </section>

          {/* WHO WE SHARE YOUR DATA WITH */}
          <section className="mb-[35px]">
            <h2
              className="text-[30px] font-normal leading-tight text-[#181818] uppercase tracking-normal mb-2"
              style={headingStyle}
            >
              WHO WE SHARE YOUR DATA WITH
            </h2>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              <strong className="font-bold text-[#181818]">Suggested text:</strong>{" "}
              If you request a password reset, your IP address will be included in the reset email.
            </p>
          </section>

          {/* HOW LONG WE RETAIN YOUR DATA */}
          <section className="mb-[35px]">
            <h2
              className="text-[30px] font-normal leading-tight text-[#181818] uppercase tracking-normal mb-2"
              style={headingStyle}
            >
              HOW LONG WE RETAIN YOUR DATA
            </h2>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              <strong className="font-bold text-[#181818]">Suggested text:</strong>{" "}
              If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.
            </p>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.
            </p>
          </section>

          {/* WHAT RIGHTS YOU HAVE OVER YOUR DATA */}
          <section className="mb-[35px]">
            <h2
              className="text-[30px] font-normal leading-tight text-[#181818] uppercase tracking-normal mb-2"
              style={headingStyle}
            >
              WHAT RIGHTS YOU HAVE OVER YOUR DATA
            </h2>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              <strong className="font-bold text-[#181818]">Suggested text:</strong>{" "}
              If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.
            </p>
          </section>

          {/* WHERE YOUR DATA IS SENT */}
          <section className="mb-[35px]">
            <h2
              className="text-[30px] font-normal leading-tight text-[#181818] uppercase tracking-normal mb-2"
              style={headingStyle}
            >
              WHERE YOUR DATA IS SENT
            </h2>
            <p className="text-[17px] sm:text-[20px] text-[#181818] leading-[1.65] font-normal mb-[35px]">
              <strong className="font-bold text-[#181818]">Suggested text:</strong>{" "}
              Visitor comments may be checked through an automated spam detection service.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
