# Formizo VS Code Style Form Builder Prompt

Use this prompt to build the Formizo web UI in a consistent direction.

## Product Direction

Build a VS Code inspired form builder web app for Formizo. The experience should feel like a lightweight editor for creating Typeform-style forms: users create form files, edit form structure in a markdown-like builder, preview the form beside the editor, save drafts, and publish when ready.

This task is UI-only. Do not connect to the backend yet. Use clean local state and mock data where needed.

## Core Experience

The app should look and behave like a VS Code workspace:

- Left Activity Bar
- Explorer tree
- Editor tabs
- Main editor surface
- Split editor/preview pane
- Status bar
- Command palette

The design should stay close to the existing VS Code shell components in `apps/web/components/layout/vscode-shell`.

## Required Explorer Files

The Explorer must always show these public files:

- `welcome.md`
- `guide.md`

These files are public and accessible without authentication.

`welcome.md` acts as the landing page. When opened, it should show product details for Formizo:

- What Formizo is
- Why users should create forms with it
- Key features
- A primary action to create a form

`guide.md` acts as the help page. When opened, it should show usage guidance:

- How to create a form file
- How to add fields
- How to use `/` suggestions
- How preview works
- How drafts are saved
- How publishing works
- Keyboard shortcuts
- Basic form-building flow

## Form Files

Authenticated users can create form files from the Explorer using the add-file button, similar to VS Code.

When a user enters a file name:

- Create a new form file in the Explorer.
- Ensure the name ends with `.form`.
- Open the new form in the editor.
- Show a dirty dot when the file has unsaved local changes.
- Save as draft after edits.

If the user is not authenticated, clicking create should open the authentication flow or command palette.

## Editor Layout

When a form file is open, the editor should be split into two panes:

- Left pane: markdown-like form editor
- Right pane: live preview

The left pane is where users define fields and settings. The right pane shows the resulting public form as respondents would see it.

Use VS Code-like tabs at the top. Unsaved files should show a small dot indicator near the file name.

## Slash Command Builder

Inside the form editor, typing `/` should open a suggestion menu.

Suggestions should include common form blocks:

- Short text
- Long text
- Email
- Phone
- Number
- URL
- Date
- Time
- Multiple choice
- Checkboxes
- Dropdown
- Rating
- Opinion scale
- Yes/No
- File upload
- Statement
- Section
- Thank you screen

When the user selects a suggestion:

- Insert the corresponding field block into the editor.
- Update the preview immediately.
- Mark the file dirty.

The suggestion menu should support:

- Arrow key navigation
- Enter to select
- Escape to close
- Mouse selection

## Form Data Shape

Follow the database direction in `packages/database/models/form.ts`.

The UI state should model:

- Form metadata
- Access mode: public or authenticated
- Optional password protection
- Result visibility: hidden, after submit, or creator only
- Fields
- Field options
- Logic rules
- Responses/answers only as mock preview data if needed

Do not implement persistence yet. Keep data in local React state.

## Draft And Publish Flow

Draft behavior:

- Editing a form marks the file dirty.
- Saving clears the dirty indicator.
- Draft status should be visible in the UI.

Publish behavior:

- Publishing should feel like a git push in VS Code.
- Add a publish action in the UI, such as a status bar button or command palette command.
- On publish, update the local form status from `draft` to `published`.
- Show a clean, subtle confirmation state.

No backend call is required yet.

## Command Palette

The command palette should support keyboard navigation:

- ArrowUp
- ArrowDown
- Enter
- Escape

Useful commands:

- Create New Form
- Open `welcome.md`
- Open `guide.md`
- Save Draft
- Publish Form
- Toggle Preview
- Add Field
- Sign In

## UI Quality Rules

- Build the actual app experience, not a marketing landing page.
- Keep UI dense, useful, and editor-like.
- Avoid big hero cards and decorative sections.
- Use existing component style where possible.
- Use lucide icons where helpful.
- Ensure text does not overflow buttons, tabs, or Explorer rows.
- Make all keyboard interactions feel natural.
- Keep state and components cleanly separated.

## Suggested Components

Create or refactor toward these components:

- `ExplorerPanel`
- `EditorArea`
- `EditorTabs`
- `WelcomeDocument`
- `GuideDocument`
- `FormEditor`
- `FormPreview`
- `SlashCommandMenu`
- `PublishControl`
- `DirtyFileIndicator`

## Definition Of Done

The UI is complete when:

- `welcome.md` and `guide.md` always appear in the Explorer.
- Public docs open without authentication.
- Authenticated users can create multiple `.form` files.
- Created form files open in the editor.
- Form editor and live preview are shown side by side.
- `/` opens a keyboard-accessible suggestion menu.
- Selecting a suggestion adds a field and updates preview.
- Dirty state is shown when edits are unsaved.
- Save draft clears dirty state.
- Publish changes form status to `published`.
- Command palette supports core commands and keyboard navigation.
- No backend connection is required.
