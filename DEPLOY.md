# Deploy on Render (name: dailyalamdaar.onrender.com)

1. Make a free account at https://render.com (sign up with GitHub).
2. Dashboard → **New +** → **Blueprint** → connect the repo `muzammilzuberi6/Daily-Alamdaar` → Apply.
   (Render reads `render.yaml` and creates the service named `dailyalamdaar`.)
3. When asked, type a strong **ADMIN_PASSWORD**.
4. Wait for the first deploy (3-5 min). Site: https://dailyalamdaar.onrender.com
   - If the name is already taken, Render adds letters; change `SITE_URL` in Environment to the real address.
5. Admin: https://dailyalamdaar.onrender.com/admin

## Keeping your news and e-paper (important)
Free plan files are erased on every restart/sleep. To keep everything:
- Change plan to **Starter** and add a **Disk** (mount path `/var/data`).
- Add environment variable `DATA_DIR=/var/data`.
(Both are already written, commented, in `render.yaml`.)

## Free plan notes
- The site sleeps after 15 min without visitors; the first visit then takes ~30 s.
- Contact messages and stories are lost on restart unless a disk is used.
