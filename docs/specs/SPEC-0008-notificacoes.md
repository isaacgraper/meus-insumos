---
id: SPEC-0008
title: Notificações por e-mail
status: Draft
version: 0.1
owner: Isaac Kleimann Graper
satisfies: [RF09]
depends_on: [SPEC-0004, SPEC-0005]
milestone: M4
---

# SPEC-0008 — Notificações por e-mail

## 1. Behaviour

**AC-0008-01** — Every NE transition sends an e-mail to the NE's responsável
naming the ATA, the insumo, the previous and new stage, and the actor.

**AC-0008-02** — Dispatch is asynchronous and never blocks the transaction. An
SMTP failure does not roll back a state change; the transition is the record of
truth, the e-mail is a courtesy.

**AC-0008-03** — Failed sends are retried with exponential backoff up to 5
attempts, then recorded as failed and surfaced in an admin view. Silently
dropped notifications train users to distrust the system.

**AC-0008-04** — A user may opt out of advisory notifications but not of those
addressed to them as responsável for an action.

**AC-0008-05** — E-mails contain no personal data beyond the recipient's own
name, and no CPF or SIAPE (RNF07).

**AC-0008-06** — In non-production environments, e-mail is written to a local
maildir rather than sent. A test asserts no external SMTP connection is opened
when `APP_ENV != production`.

## 2. Note

The RFC lists Resend as an option. For an on-premise state-government
deployment, an external e-mail SaaS may be prohibited by the entity's data
policy and may not reach internal `.gov.br` recipients. The interface is
abstracted behind a `NotificationSender` port so the transport is a
configuration choice; institutional SMTP is the default. See OQ-13.

## 3. Changelog

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-08-17 | Initial draft from RFC §2.3 RF09, §5.1 |
