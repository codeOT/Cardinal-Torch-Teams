# Team Center

Collaboration dashboard with tasks, daily logs, and email notifications via [Resend](https://resend.com).

## Email notifications (Resend)

Members receive emails when:

- They are **assigned a task**
- A task **status changes** (assignees + task creator, except whoever made the change)
- Someone **comments** on their task

Add to `.env.local`:

```env
RESEND_API_KEY=re_your_api_key
RESEND_FROM=Team Center <onboarding@resend.dev>
APP_URL=http://localhost:3000
```

- Get an API key from [resend.com/api-keys](https://resend.com/api-keys)
- For testing, use `onboarding@resend.dev` as the sender (Resend only delivers to your verified email until you add a domain)
- For production, verify your domain and set `RESEND_FROM` to e.g. `Team Center <notifications@yourdomain.com>`

If `RESEND_API_KEY` or `RESEND_FROM` is missing, the app works normally but skips sending emails.

Emails use each member's signup/login address from the database.
