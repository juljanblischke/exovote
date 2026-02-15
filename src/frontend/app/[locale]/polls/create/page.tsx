'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { Plus, Trash2, Copy, Check, ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';

type PollType = 'SingleChoice' | 'MultipleChoice' | 'Ranked';

type FormState = {
  title: string;
  description: string;
  type: PollType;
  options: string[];
  expiresAt: string;
};

type FormErrors = {
  title?: string;
  options?: string[];
  general?: string;
  expiresAt?: string;
};

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 20;
const MAX_TITLE_LENGTH = 200;
const MAX_OPTION_LENGTH = 500;

export default function CreatePollPage() {
  const t = useTranslations('polls');
  const ct = useTranslations('common');
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    type: 'SingleChoice',
    options: ['', ''],
    expiresAt: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdPollId, setCreatedPollId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const optionErrors: string[] = [];

    if (!form.title.trim()) {
      newErrors.title = t('create.validation.titleRequired');
    } else if (form.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = t('create.validation.titleMaxLength', { max: MAX_TITLE_LENGTH });
    }

    const filledOptions = form.options.filter((o) => o.trim());
    if (filledOptions.length < MIN_OPTIONS) {
      newErrors.general = t('create.validation.minOptions', { min: MIN_OPTIONS });
    }

    const uniqueOptions = new Set(filledOptions.map((o) => o.trim().toLowerCase()));
    if (uniqueOptions.size !== filledOptions.length) {
      newErrors.general = t('create.validation.duplicateOption');
    }

    form.options.forEach((option, i) => {
      if (!option.trim() && filledOptions.length < MIN_OPTIONS) {
        optionErrors[i] = t('create.validation.optionRequired');
      } else if (option.length > MAX_OPTION_LENGTH) {
        optionErrors[i] = t('create.validation.optionMaxLength', { max: MAX_OPTION_LENGTH });
      }
    });

    if (optionErrors.some(Boolean)) {
      newErrors.options = optionErrors;
    }

    if (form.expiresAt) {
      const expDate = new Date(form.expiresAt);
      if (expDate <= new Date()) {
        newErrors.expiresAt = t('create.validation.expirationFuture');
      }
    }

    setErrors(newErrors);
    return !newErrors.title && !newErrors.general && !newErrors.options && !newErrors.expiresAt;
  }, [form, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        options: form.options.filter((o) => o.trim()).map((o) => o.trim()),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      const data = await apiFetch<{ pollId: string }>('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setCreatedPollId(data.pollId);
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : t('errors.serverError'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    setForm((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const addOption = () => {
    if (form.options.length >= MAX_OPTIONS) return;
    setForm((prev) => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (index: number) => {
    if (form.options.length <= MIN_OPTIONS) return;
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const copyShareLink = async () => {
    if (!createdPollId) return;
    const url = `${window.location.origin}/polls/${createdPollId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success state
  if (createdPollId) {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/polls/${createdPollId}`;
    return (
      <div className="relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0 -z-10" />
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-12">
          <Card glass className="w-full text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">{t('create.success')}</h2>

            <div className="mt-6 space-y-3">
              <FormField label={t('create.shareLinkLabel')}>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="font-mono text-xs" />
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={copyShareLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? t('share.copied') : t('share.copyLink')}
                  </Button>
                </div>
              </FormField>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => router.push('/polls/create')}
                >
                  {ct('create')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => router.push(`/polls/${createdPollId}`)}
                >
                  {t('results.title')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="gradient-mesh absolute inset-0 -z-10" />
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {ct('back')}
        </Link>

        <h1 className="text-gradient mb-8 text-3xl font-bold sm:text-4xl">
          {t('create.title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Card glass>
            <div className="space-y-4">
              <FormField
                label={t('create.titleLabel')}
                htmlFor="title"
                required
                error={errors.title}
              >
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder={t('create.titlePlaceholder')}
                  maxLength={MAX_TITLE_LENGTH}
                  error={errors.title}
                />
              </FormField>

              <FormField
                label={t('create.descriptionLabel')}
                htmlFor="description"
              >
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={t('create.descriptionPlaceholder')}
                  rows={3}
                />
              </FormField>
            </div>
          </Card>

          {/* Poll Type */}
          <Card glass>
            <FormField
              label={t('create.typeLabel')}
              htmlFor="type"
              required
            >
              <Select
                id="type"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as PollType }))}
              >
                <option value="SingleChoice">{t('types.singleChoice')}</option>
                <option value="MultipleChoice">{t('types.multipleChoice')}</option>
                <option value="Ranked">{t('types.ranked')}</option>
              </Select>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {form.type === 'SingleChoice' && t('types.singleChoiceDescription')}
                {form.type === 'MultipleChoice' && t('types.multipleChoiceDescription')}
                {form.type === 'Ranked' && t('types.rankedDescription')}
              </p>
            </FormField>
          </Card>

          {/* Options */}
          <Card glass>
            <div className="space-y-3">
              <FormField
                label={t('create.optionsLabel')}
                required
                error={errors.general}
              >
                <div className="space-y-2">
                  {form.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={t('create.optionPlaceholder', { number: index + 1 })}
                        maxLength={MAX_OPTION_LENGTH}
                        error={errors.options?.[index]}
                      />
                      {form.options.length > MIN_OPTIONS && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="md"
                          onClick={() => removeOption(index)}
                          aria-label={t('create.removeOption')}
                          className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </FormField>

              {form.options.length < MAX_OPTIONS && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('create.addOption')}
                </Button>
              )}
            </div>
          </Card>

          {/* Expiration */}
          <Card glass>
            <FormField
              label={t('create.expirationLabel')}
              htmlFor="expiresAt"
              help={t('create.expirationHelp')}
              error={errors.expiresAt}
            >
              <Input
                id="expiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                error={errors.expiresAt}
              />
            </FormField>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            className="w-full"
          >
            {submitting ? t('create.creating') : t('create.submitButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}
