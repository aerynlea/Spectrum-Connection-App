type NewsletterOptInFieldProps = {
  defaultChecked?: boolean;
};

export function NewsletterOptInField({
  defaultChecked = false,
}: NewsletterOptInFieldProps) {
  return (
    <div className="field">
      <span>Email updates</span>
      <p className="field-help">
        Optional. Get weekly next-step recaps, event announcements, and
        important Guiding Light updates. You can change this preference later
        from your profile.
      </p>
      <label className="checkbox-pill" htmlFor="newsletterSubscribed">
        <input
          defaultChecked={defaultChecked}
          id="newsletterSubscribed"
          name="newsletterSubscribed"
          type="checkbox"
          value="yes"
        />
        <span className="checkbox-pill__content">
          <strong>Send me the newsletter</strong>
          <span>
            Email me about weekly support recaps, new events, community
            updates, and major site changes.
          </span>
        </span>
      </label>
    </div>
  );
}
