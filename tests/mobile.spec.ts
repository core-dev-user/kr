import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Uma conversa de cada vez.', { exact: true })).toBeVisible();
});
test('temas e navegação preservam idioma selecionado', async ({ page }) => {
  await page.getByRole('button', { name: 'Selecionar Japonês', exact: true }).click();
  await expect(page.getByText('こんにちは!', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Selecionar Francês', exact: true }).click();
  await expect(page.getByText('Bonjour!', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: /Jornada/ }).click();
  await expect(page.getByText('Sua jornada em francês.', { exact: true })).toBeVisible();
  await expect(page.getByText('Planejamento editorial · sem lições publicadas')).toHaveCount(5);
});
test('caderno salva, edita e mantém isolamento depois de recarregar', async ({ page }) => {
  await page.getByRole('tab', { name: /Caderno/ }).click();
  await page.getByRole('button', { name: 'Nova anotação', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Conteúdo da anotação' })
    .fill('안녕하세요 é uma forma educada.');
  await page.getByRole('button', { name: 'Salvar anotação', exact: true }).click();
  await expect(page.getByText('안녕하세요 é uma forma educada.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Selecionar Francês', exact: true }).click();
  await expect(page.getByText('안녕하세요 é uma forma educada.', { exact: true })).toHaveCount(0);
  await page.reload();
  await page.getByRole('tab', { name: /Caderno/ }).click();
  await page.getByRole('button', { name: 'Selecionar Coreano', exact: true }).click();
  await expect(page.getByText('안녕하세요 é uma forma educada.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Conteúdo da anotação' })
    .fill('Revisar apresentação amanhã.');
  await page.getByRole('button', { name: 'Salvar anotação', exact: true }).click();
  await page.reload();
  await page.getByRole('tab', { name: /Caderno/ }).click();
  await expect(page.getByText('Revisar apresentação amanhã.', { exact: true })).toBeVisible();
});
test('timer pausa, conclui e atualiza só o progresso do coreano', async ({ page }) => {
  await page.getByRole('button', { name: 'Começar a conversar', exact: true }).click();
  await expect(page.getByText('TEMPO ATIVO · ESTUDANDO')).toBeVisible();
  await expect(page.getByLabel(/segundos de estudo/)).not.toHaveText('00:00');
  await page.getByRole('button', { name: 'Pausar cronômetro', exact: true }).click();
  const frozen = await page.getByLabel(/segundos de estudo/).textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByLabel(/segundos de estudo/)).toHaveText(frozen!);
  await page.getByRole('button', { name: 'Concluir prática', exact: true }).click();
  await page.getByRole('button', { name: 'Abrir jornada de Coreano' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Abrir jornada de Coreano' })).toContainText(
    '1 lições',
  );
  await expect(page.getByRole('button', { name: 'Abrir jornada de Francês' })).toContainText(
    '0 lições',
  );
  await page.reload();
  await expect(page.getByRole('button', { name: 'Abrir jornada de Coreano' })).toContainText(
    '1 lições',
  );
});
test('layout móvel não transborda e três ambientações renderizam sem erro', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const language of ['Coreano', 'Japonês', 'Francês']) {
    await page.getByRole('button', { name: `Selecionar ${language}`, exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Começar a conversar', exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId('language-hero')).toHaveCSS('opacity', '1');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: `test-results/dashboard-${language}.png`, fullPage: true });
  }
  expect(errors).toEqual([]);
});
