import { useState, type FormEvent } from "react";
import { ArrowUpRight, Download, FileText, Github, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/landing/components/animate";
import { Container, CopyButton, PageHeader } from "@/landing/components/ui";
import { useContent } from "@/landing/i18n/LocaleContext";
import { format } from "@/landing/i18n/locale";
import type { SiteContent } from "@/landing/i18n/types";
import { ISSUES_NEW_URL, ISSUES_URL, RELEASES_PAGE_URL, REPO_URL, docHref } from "@/landing/site";
import { cn } from "@/lib/utils";

type TopicId = "sugestao" | "bug" | "duvida" | "outro";

const TOPIC_IDS: readonly TopicId[] = ["sugestao", "bug", "duvida", "outro"];

const CHANNEL_ICONS = [Github, Download, FileText];

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  topic: TopicId;
  message: string;
}

type FormErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

const EMPTY_FORM: ContactForm = {
  name: "",
  email: "",
  subject: "",
  topic: "sugestao",
  message: "",
};

const CHANNEL_HREFS = [ISSUES_URL, RELEASES_PAGE_URL, docHref()];

function validate(values: ContactForm, messages: SiteContent["contact"]["form"]["errors"]): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 2) errors.name = messages.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = messages.email;
  if (values.subject.trim().length < 3) errors.subject = messages.subject;
  if (values.message.trim().length < 20) errors.message = messages.message;
  return errors;
}

function buildIssueUrl(values: ContactForm, topicLabel: string, issue: SiteContent["contact"]["form"]["issue"]): string {
  const title = `[${topicLabel}] ${values.subject.trim()}`;
  const body = [
    `**${issue.name}:** ${values.name.trim()}`,
    `**${issue.email}:** ${values.email.trim()}`,
    `**${issue.type}:** ${topicLabel}`,
    "",
    values.message.trim(),
    "",
    `_${issue.footer}_`,
  ].join("\n");

  return `${ISSUES_NEW_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

export function Contact() {
  const content = useContent();
  const c = content.contact;
  const form = c.form;
  const [values, setValues] = useState<ContactForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [issueUrl, setIssueUrl] = useState<string | null>(null);

  function update<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key as keyof FormErrors]) return previous;
      const next = { ...previous };
      delete next[key as keyof FormErrors];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values, form.errors);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setIssueUrl(null);
      return;
    }

    const url = buildIssueUrl(values, form.topics[values.topic], form.issue);
    setIssueUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="landing-page-enter">
      <PageHeader eyebrow={c.header.eyebrow} title={c.header.title} description={c.header.description} />

      <Container className="grid gap-4 py-8 sm:py-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-6">
        <div className="flex flex-col gap-3">
          {c.channels.map((channel, index) => {
            const Icon = CHANNEL_ICONS[index] ?? Github;
            return (
              <Reveal key={channel.title} delay={index * 80}>
                <a
                  href={CHANNEL_HREFS[index] ?? ISSUES_URL}
                  target={CHANNEL_HREFS[index]?.startsWith("#") ? undefined : "_blank"}
                  rel={CHANNEL_HREFS[index]?.startsWith("#") ? undefined : "noreferrer"}
                  className="landing-lift group flex gap-3 border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/20"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-[12.5px] font-semibold tracking-tight">{channel.title}</h2>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{channel.description}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                      {channel.action}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}

          <Reveal variant="fade" delay={240}>
            <div className="border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-[12.5px] font-semibold tracking-tight">{c.privacy.title}</h2>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{c.privacy.description}</p>
            </div>
          </Reveal>

          <Reveal variant="fade" delay={300}>
            <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
              {c.startFresh.before}
              <a
                href={ISSUES_NEW_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {c.startFresh.issue}
              </a>
              {c.startFresh.middle}
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                {c.startFresh.repo}
              </a>
              {c.startFresh.after}
            </p>
          </Reveal>
        </div>

        <Reveal variant="right" delay={120} className="h-full">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="h-full border border-border bg-card"
            aria-labelledby="contact-form-title"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
              <div>
                <h2 id="contact-form-title" className="text-[13.5px] font-semibold tracking-tight">
                  {form.title}
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{form.subtitle}</p>
              </div>
              <Badge variant="outline">
                <Github className="h-3 w-3" />
                GitHub
              </Badge>
            </div>

            <div className="grid gap-3 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="contact-name" className="text-[10px]">
                    {form.labels.name}
                  </Label>
                  <Input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    placeholder={form.placeholders.name}
                    className="h-9 text-[12.5px]"
                    value={values.name}
                    onChange={(event) => update("name", event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                  />
                  {errors.name ? (
                    <p id="contact-name-error" role="alert" className="text-[11px] text-destructive">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="contact-email" className="text-[10px]">
                    {form.labels.email}
                  </Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={form.placeholders.email}
                    className="h-9 text-[12.5px]"
                    value={values.email}
                    onChange={(event) => update("email", event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                  />
                  {errors.email ? (
                    <p id="contact-email-error" role="alert" className="text-[11px] text-destructive">
                      {errors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <div className="grid gap-1.5">
                  <Label htmlFor="contact-subject" className="text-[10px]">
                    {form.labels.subject}
                  </Label>
                  <Input
                    id="contact-subject"
                    name="subject"
                    placeholder={form.placeholders.subject}
                    className="h-9 text-[12.5px]"
                    value={values.subject}
                    onChange={(event) => update("subject", event.target.value)}
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                  />
                  {errors.subject ? (
                    <p id="contact-subject-error" role="alert" className="text-[11px] text-destructive">
                      {errors.subject}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="contact-topic" className="text-[10px]">
                    {form.labels.topic}
                  </Label>
                  <select
                    id="contact-topic"
                    name="topic"
                    className="h-9 w-full border border-input bg-background px-2 text-[12.5px] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    value={values.topic}
                    onChange={(event) => update("topic", event.target.value as TopicId)}
                  >
                    {TOPIC_IDS.map((topic) => (
                      <option key={topic} value={topic}>
                        {form.topics[topic]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="contact-message" className="text-[10px]">
                  {form.labels.message}
                </Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  maxLength={4000}
                  placeholder={form.placeholders.message}
                  className="min-h-[132px] text-[12.5px]"
                  value={values.message}
                  onChange={(event) => update("message", event.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                />
                {errors.message ? (
                  <p id="contact-message-error" role="alert" className="text-[11px] text-destructive">
                    {errors.message}
                  </p>
                ) : null}
                <p className="text-[10.5px] text-muted-foreground">
                  {format(form.counter, { count: values.message.trim().length })}
                </p>
              </div>

              {issueUrl ? (
                <div role="status" className="landing-enter border border-primary/30 bg-primary/5 p-3">
                  <p className="text-[12px] font-medium text-primary">{form.successTitle}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                    {form.successDescription}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <a
                      href={issueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "landing-cta h-7 text-[11px]",
                      )}
                    >
                      {form.successLink}
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                    <CopyButton value={issueUrl} label={form.copyLink} className="h-7 text-[11px]" />
                    <button
                      type="button"
                      onClick={() => setIssueUrl(null)}
                      className="h-7 px-1 text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      {form.edit}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                <Button type="submit" className="landing-cta h-10 px-4 text-[13px]">
                  <Github className="h-4 w-4" />
                  {form.submit}
                </Button>
                <p className="text-[11px] text-muted-foreground">{form.disclaimer}</p>
              </div>
            </div>
          </form>
        </Reveal>
      </Container>
    </div>
  );
}
