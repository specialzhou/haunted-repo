# Requirements: Issue Monsters

Turn a public GitHub repository's open issues into monsters in a haunted house.

## User stories
1. As a maintainer, I see which issues have been open longest, so I can judge my backlog at a glance.
2. As a new contributor, I see which monsters are beginner-friendly, so I can find a starting point.
3. As someone evaluating a project, I get a feel for its maintenance state in seconds.

## Acceptance criteria (EARS)
1. WHEN the app loads, THE SYSTEM SHALL show a bundled snapshot of a real public repository without any network call.
2. WHEN the user enters `owner/repo`, THE SYSTEM SHALL fetch open issues from the public GitHub API and show one monster per issue.
3. THE SYSTEM SHALL read only these issue fields: number, title, labels, created_at, html_url. It SHALL NOT store or show bodies, comments, usernames or avatars.
3a. WHEN an issue is among the 5 oldest open issues, THE SYSTEM SHALL draw a red glow ring around its monster without changing its fill color.
4. THE SYSTEM SHALL pull requests out of the issue list (the issues API also returns PRs).
5. WHEN an issue is older, THE SYSTEM SHALL give it a monster of equal or larger size than a newer issue with the same labels.
6. WHEN an issue has a label in the beginner set (`good first issue`, `help wanted`, `beginner`, `easy`), THE SYSTEM SHALL mark its monster as beginner-friendly.
7. WHEN the user clicks a monster, THE SYSTEM SHALL show the issue number and title and a link to the issue on GitHub.
8. IF the API call fails or is rate limited, THEN THE SYSTEM SHALL show a clear message and offer the snapshot.
9. THE SYSTEM SHALL work as a static site with no backend and no API key.
