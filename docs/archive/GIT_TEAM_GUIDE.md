# GitHub + Git: the team's professional workflow (Windows)

## A. Set up once (Member 1)
1. Everyone creates their **own GitHub account**, installs **Git** and **VS Code**. Configure your own username/email:

   ```powershell
   git config --global user.name "Your Real Name"
   git config --global user.email "you@example.com"
   ```

2. Decide with the customer whether the repository can be public. **Private is the safest default until you have permission.**
3. Member 1 makes a **new empty repository** named `cv-tool` on GitHub (do not tick pre-populated README, license or .gitignore; these exist in the ZIP).
4. Member 1 extracts ZIP, opens terminal in extracted folder, then runs (replace with the **real** URL GitHub shows):

   ```powershell
   git init
   git add .
   git commit -m "chore: add CV Studio starter and team docs"
   git branch -M main
   git remote add origin https://github.com/YOUR-ACCOUNT/cv-tool.git
   git push -u origin main
   ```

5. On GitHub repository **Settings → Collaborators and teams**, invite the other 3 members. Each accepts the invitation.
6. Create **GitHub Project** board: `Backlog`, `Ready`, `In progress`, `In review`, `Done`; copy backlog from `docs/archive/PROJECT_PLAN.md` to Issues and assign owners.
7. In **Settings → Rules → Rulesets** (or **Branches**), protect `main`: use pull requests, require **one approving review**, require passing checks if your repository plan supports them, and block force pushes. If unavailable for your repository type/account, follow these rules as a team manually.
8. Configure CI by checking **Actions → Verify CV Tool** after pushing.

## Publish the actual web application

The repository includes a GitHub Pages deployment workflow. After the first push, enable it under **Settings → Pages → Source: GitHub Actions**, then check the `Deploy CV Studio website` run in the Actions tab. See [`WEB_APP_DEPLOYMENT.md`](../technical/WEB_APP_DEPLOYMENT.md) for full instructions. **Only `main` deploys**; feature branches are developed and reviewed independently.

## B. Clone once (Members 2, 3, 4)
After access is granted:

```powershell
git clone https://github.com/YOUR-ACCOUNT/cv-tool.git
cd cv-tool
npm start
```

Use the actual URL shown on GitHub. All work must be in this shared repository, not four separate ZIP files.

## C. Every task: same repeatable process
1. Pick one GitHub Issue and assign yourself. Move it to **In progress**.
2. Get the latest `main`, then create a focused branch:

   ```powershell
   git switch main
   git pull origin main
   git switch -c feature/cv-04-work-experience
   ```

3. Code and test (`npm run check`). Commit small, meaningful changes:

   ```powershell
   git status
   git add src/app.js tests/model.test.js
   git commit -m "feat(editor): improve experience fields"
   git push -u origin feature/cv-04-work-experience
   ```

4. Open GitHub → **Compare & pull request** targeting `main`. Use the PR template; link the Issue (e.g. `Closes #12` where `12` is a real GitHub issue number).
5. Assign another team member as reviewer. Wait for checks and review; fix issues with additional commits to the same branch.
6. After approval merge on GitHub using **Squash and merge** if desired, close Issue, move it to **Done**.
7. Back on your computer:

   ```powershell
   git switch main
   git pull origin main
   git branch -d feature/cv-04-work-experience
   ```

## D. If `main` changed before your PR
With your feature branch checked out:

```powershell
git fetch origin
git merge origin/main
```

If files conflict, Git marks `<<<<<<<`, `=======`, `>>>>>>>`. Edit carefully together, remove conflict markers, test, then:

```powershell
git add .
git commit
git push
```

Do not force push to `main`, do not commit real CVs or passwords, and do not edit another member's branch without discussing it. Review diffs before committing.

## E. Command cheat sheet

| Command | Purpose |
| --- | --- |
| `git status` | Show changed files and branch |
| `git branch` | List local branches |
| `git switch main` | Switch to main |
| `git pull origin main` | Update from GitHub |
| `git switch -c feature/short-name` | Start new task branch |
| `git add path/to/file` | Stage a reviewed change |
| `git commit -m "..."` | Record a meaningful contribution |
| `git push -u origin branch-name` | Publish branch for PR |
| `git log --oneline --max-count=10` | Review latest commits |
| `npm run check` | Syntax + unit tests |

## F. Team rules
- **One Issue → one branch → one PR** whenever practical.
- Everyone commits from their own machine/account, even when collaborating.
- Another student reviews each PR. The author cannot approve their own work.
- Never push unfinished/unreviewed work straight to `main`.
- Communicate file overlap in Teams/WhatsApp before coding; propose schema changes as an Issue.
- Update GitHub Issue/board every day. Written discussion and reviews are part of professional engineering work.
- Keep commits focused and descriptive (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- Screenshot and manual verification instructions for visual changes; use fictional data only.

## G. If you've never used Git before
Have each member practice on a tiny documentation edit first: edit a sentence in `docs/project/TEAM_AGREEMENT.md`, make a branch, commit, push, open PR and ask for review. Do **not** all edit the same line at once. This confirms everyone knows the full workflow.
