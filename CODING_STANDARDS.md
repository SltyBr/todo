# Coding Standards

Rules for reviewing a diff in this repo. Every rule here is a judgement call; anything mechanical belongs in `npm run check` instead.

## Domain language

Names use the vocabulary in `GLOSSARY.md`: identifiers, file names, CSS classes, UI text, and test names. Flag any term the glossary lists under _Avoid_ when it stands for a domain concept (`TodoItem` names a Todo, so it is a breach). Platform vocabulary is fine: ARIA roles like `listitem` and `textbox`, DOM attributes, CSS properties.

A domain concept with no glossary entry is a finding too: it either needs a glossary term or is invented language.

## Decisions

Code follows the ADRs in `docs/adr/`. A diff that contradicts one is a finding unless the same change adds or supersedes an ADR explaining why.
