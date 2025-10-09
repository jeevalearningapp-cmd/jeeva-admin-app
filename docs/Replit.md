# Jeeva Admin Portal – Replit Workspace & Environment Guide

## Quickstart

1. **Fork or Clone Workspace:**

   - Use Replit's dashboard to fork or clone the Jeeva Admin Portal repo.

2. **Set Environment Variables:**

   - Add Supabase details using Replit's Secrets panel or local `.env` file:

     ```
     SUPABASE_URL=your-supabase-url
     SUPABASE_ANON_KEY=your-supabase-anon-key
     SUPABASE_SERVICE_KEY=your-service-key-if-needed
     ```

3. **Install Dependencies:**

```
npm install
```

4. **Start Development Server:**

```
npm run dev
```

---

## Key Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Public API key for browser/client
- `SUPABASE_SERVICE_KEY`: Server-side/admin key (optional, for backend or admin functions only—never exposed client-side)

**Tip:** Only use Replit's Secrets tab or `.env` for sensitive keys. Never commit `.env` to version control for production.

---

## Project File Structure

- See full explanation in `README.md`
- All app files live under `/src`, organized by feature, component, and domain

---

## Deployment

- **Production Build:**

```
npm run build
```

- **Static Hosting:** Use Replit's configuration for web/static hosting, serve build output via web tab

---

## Secrets & Security

- Always store Supabase keys via Secrets panel—never commit them.
- Audit RLS policy and test access for every admin type before launch.
- For backup and migration, use Supabase dashboard or CLI to export schema.

---

## Workspace Tips

- Use Replit's shell for all commands (`npm install`, `npm run dev`)
- Troubleshoot network/CORS issues by checking Supabase project and workspace settings
- Leverage version control/snapshot tools for development

---

## References

- See `README.md` for onboarding workflow and file structure
- See `supabase.md` for database, RLS, and role documentation
- See `theme.md` for branding and UI settings

---

## Next Steps

- Confirm Supabase tables and RLS policies are locked for all admin and student flows
- Use provided documentation to scaffold new features and test protected routes/components
