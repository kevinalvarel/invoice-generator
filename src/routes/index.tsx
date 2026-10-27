import { useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'

export const Route = createFileRoute('/')({ component: InvoicePage })

const today = new Date().toLocaleDateString('en-CA')

const initialInvoice = {
  sellerName: '',
  sellerEmail: '',
  sellerPhone: '',
  sellerNpwp: '',
  sellerAddress: '',
  buyerName: '',
  buyerEmail: '',
  buyerAddress: '',
  number: '',
  issued: today,
  due: '',
  taxRate: '',
  bankName: '',
  bankAccount: '',
  bankHolder: '',
  notes: '',
}

type InvoiceField = keyof typeof initialInvoice
type Item = { id: string; description: string; qty: string; price: string }
type ItemField = Exclude<keyof Item, 'id'>

const numberFormat = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 2,
})
const dateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const money = (value: number) => `Rp ${numberFormat.format(value)}`
const toNumber = (value: string) => Math.max(0, Number(value) || 0)
const lineTotal = (item: Item) =>
  Math.round(toNumber(item.qty) * toNumber(item.price))
const formatDate = (value: string) =>
  value ? dateFormat.format(new Date(`${value}T00:00:00`)) : '-'

function emptyItem(): Item {
  return { id: crypto.randomUUID(), description: '', qty: '', price: '' }
}

function InvoicePage() {
  const [invoice, setInvoice] = useState(initialInvoice)
  const [items, setItems] = useState<Item[]>(() => [emptyItem()])

  const bind = (key: InvoiceField) => ({
    value: invoice[key],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setInvoice((current) => ({ ...current, [key]: event.target.value })),
  })

  const updateItem = (id: string, key: ItemField, value: string) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    )
  const addItem = () => setItems((current) => [...current, emptyItem()])
  const removeItem = (id: string) =>
    setItems((current) => current.filter((item) => item.id !== id))

  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0)
  const taxRate = toNumber(invoice.taxRate)
  const tax = Math.round(subtotal * (taxRate / 100))
  const total = subtotal + tax
  const filledItems = items.filter(
    (item) =>
      item.description.trim() || toNumber(item.qty) || toNumber(item.price),
  )
  const hasSellerContact = Boolean(
    invoice.sellerEmail.trim() || invoice.sellerPhone.trim(),
  )
  const hasPayment = Boolean(
    invoice.bankName.trim() ||
    invoice.bankAccount.trim() ||
    invoice.bankHolder.trim(),
  )

  return (
    <div className="invoice-app min-h-dvh bg-desk text-foreground print:bg-white">
      <header className="sticky top-0 z-20 border-b border-foreground/10 bg-desk print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="min-w-0">
            <h1 className="text-base font-semibold">Invoice Generator</h1>
            <p className="text-xs text-muted-foreground">
              All data is only stored locally on your device.
            </p>
          </div>
          <Button className="h-11 px-4 sm:h-9" onClick={() => window.print()}>
            Print / PDF
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-start xl:gap-12 print:block print:max-w-none print:p-0">
        <div className="min-w-0 max-w-2xl space-y-7 print:hidden">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Isi kolom di bawah. Pratinjau invoice mengikuti isian. Tombol Cetak
            / PDF membuka dialog cetak browser; pilih Simpan sebagai PDF untuk
            menyimpan file.
          </p>

          <Section title="Penerbit">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="seller-name">Nama usaha</FieldLabel>
                <Input
                  id="seller-name"
                  placeholder="Nama usaha atau nama kamu"
                  {...bind('sellerName')}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="seller-email">Email</FieldLabel>
                <Input
                  id="seller-email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                  {...bind('sellerEmail')}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="seller-phone">Telepon</FieldLabel>
                <Input
                  id="seller-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="08xx-xxxx-xxxx"
                  {...bind('sellerPhone')}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="seller-npwp">NPWP</FieldLabel>
                <Input
                  id="seller-npwp"
                  placeholder="Nomor NPWP"
                  {...bind('sellerNpwp')}
                />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="seller-address">Alamat</FieldLabel>
                <Textarea
                  id="seller-address"
                  rows={2}
                  placeholder="Jalan, kota, kode pos"
                  {...bind('sellerAddress')}
                />
              </Field>
            </div>
          </Section>

          <Section title="Pembeli">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="buyer-name">Nama</FieldLabel>
                <Input
                  id="buyer-name"
                  placeholder="Nama pelanggan atau perusahaan"
                  {...bind('buyerName')}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="buyer-email">Email</FieldLabel>
                <Input
                  id="buyer-email"
                  type="email"
                  placeholder="email@example.com"
                  {...bind('buyerEmail')}
                />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="buyer-address">Alamat</FieldLabel>
                <Textarea
                  id="buyer-address"
                  rows={2}
                  placeholder="Alamat pelanggan"
                  {...bind('buyerAddress')}
                />
              </Field>
            </div>
          </Section>

          <Section title="Detail invoice">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="invoice-number">Nomor invoice</FieldLabel>
                <Input
                  id="invoice-number"
                  placeholder="INV-001"
                  {...bind('number')}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="invoice-issued">Tanggal</FieldLabel>
                <Input id="invoice-issued" type="date" {...bind('issued')} />
              </Field>
              <Field>
                <FieldLabel htmlFor="invoice-due">Jatuh tempo</FieldLabel>
                <Input id="invoice-due" type="date" {...bind('due')} />
              </Field>
            </div>
          </Section>

          <Section title="Item">
            <div className="mb-2 hidden grid-cols-[minmax(0,1fr)_4rem_7.5rem_4rem] gap-2 text-xs text-muted-foreground sm:grid">
              <span>Deskripsi</span>
              <span>Qty</span>
              <span>Harga</span>
              <span />
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_4rem_7.5rem_4rem] sm:items-center"
                >
                  <Input
                    className="col-span-2 sm:col-span-1"
                    aria-label={`Deskripsi item ${index + 1}`}
                    placeholder="Deskripsi pekerjaan atau barang"
                    value={item.description}
                    onChange={(event) =>
                      updateItem(item.id, 'description', event.target.value)
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    aria-label={`Qty item ${index + 1}`}
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(event) =>
                      updateItem(item.id, 'qty', event.target.value)
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    aria-label={`Harga item ${index + 1}`}
                    placeholder="Harga"
                    value={item.price}
                    onChange={(event) =>
                      updateItem(item.id, 'price', event.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="col-span-2 justify-self-start text-muted-foreground hover:text-foreground sm:col-span-1 sm:justify-self-center"
                    aria-label={`Hapus item ${index + 1}`}
                    onClick={() => removeItem(item.id)}
                  >
                    Hapus
                  </Button>
                </div>
              ))}
            </div>
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada baris item. Tambah satu baris untuk mulai.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={addItem}
            >
              Tambah item
            </Button>
            <div className="mt-5 space-y-2 border-t border-foreground/10 pt-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{money(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="tax-rate" className="text-muted-foreground">
                  PPN (%)
                </label>
                <Input
                  id="tax-rate"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder="0"
                  className="h-8 w-20 text-right"
                  {...bind('taxRate')}
                />
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-foreground/10 pt-2 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{money(total)}</span>
              </div>
            </div>
          </Section>

          <Section title="Pembayaran">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="bank-name">Bank</FieldLabel>
                <Input
                  id="bank-name"
                  placeholder="Nama bank"
                  {...bind('bankName')}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="bank-account">Nomor rekening</FieldLabel>
                <Input
                  id="bank-account"
                  inputMode="numeric"
                  placeholder="Nomor rekening"
                  {...bind('bankAccount')}
                />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="bank-holder">Atas nama</FieldLabel>
                <Input
                  id="bank-holder"
                  placeholder="Nama pemilik rekening"
                  {...bind('bankHolder')}
                />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Syarat pembayaran atau catatan tambahan"
                  {...bind('notes')}
                />
              </Field>
            </div>
          </Section>
        </div>

        <div className="preview-column min-w-0 lg:sticky lg:top-20 print:static">
          <article
            className="sheet mx-auto w-full max-w-[794px] break-words bg-paper px-5 py-8 text-foreground shadow-[0_1px_2px_rgba(33,28,23,0.08),0_20px_40px_-24px_rgba(33,28,23,0.35)] ring-1 ring-foreground/5 sm:px-10 sm:py-12 print:max-w-none print:bg-white print:px-[16mm] print:py-[16mm] print:shadow-none print:ring-0"
            aria-label="Pratinjau invoice"
          >
            <div className="border-t-2 border-stamp pt-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Invoice
                </h2>
                <dl className="grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs sm:w-auto">
                  <dt className="text-muted-foreground">Nomor</dt>
                  <dd className="text-right tabular-nums">
                    {invoice.number || '-'}
                  </dd>
                  <dt className="text-muted-foreground">Tanggal</dt>
                  <dd className="text-right">{formatDate(invoice.issued)}</dd>
                  <dt className="text-muted-foreground">Jatuh tempo</dt>
                  <dd className="text-right">{formatDate(invoice.due)}</dd>
                </dl>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <section>
                  <h3 className="text-xs font-medium text-muted-foreground">
                    Dari
                  </h3>
                  <p className="mt-2 text-sm font-medium">
                    {invoice.sellerName || '-'}
                  </p>
                  {invoice.sellerAddress.trim() && (
                    <p className="mt-1 whitespace-pre-line text-sm">
                      {invoice.sellerAddress}
                    </p>
                  )}
                  {hasSellerContact && (
                    <p className="mt-1 text-sm">
                      {[invoice.sellerEmail.trim(), invoice.sellerPhone.trim()]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                  {invoice.sellerNpwp.trim() && (
                    <p className="mt-1 text-sm">NPWP {invoice.sellerNpwp}</p>
                  )}
                </section>
                <section>
                  <h3 className="text-xs font-medium text-muted-foreground">
                    Ditagihkan kepada
                  </h3>
                  <p className="mt-2 text-sm font-medium">
                    {invoice.buyerName || '-'}
                  </p>
                  {invoice.buyerAddress.trim() && (
                    <p className="mt-1 whitespace-pre-line text-sm">
                      {invoice.buyerAddress}
                    </p>
                  )}
                  {invoice.buyerEmail.trim() && (
                    <p className="mt-1 text-sm">{invoice.buyerEmail}</p>
                  )}
                </section>
              </div>

              <table className="mt-8 w-full table-fixed border-collapse text-[11px] sm:text-sm">
                <thead>
                  <tr className="border-b border-foreground/20 text-left text-muted-foreground">
                    <th className="w-auto py-2 pr-2 font-medium">Deskripsi</th>
                    <th className="w-8 py-2 text-right font-medium sm:w-12">
                      Qty
                    </th>
                    <th className="w-[4.5rem] py-2 text-right font-medium sm:w-24">
                      Harga
                    </th>
                    <th className="w-[5.25rem] py-2 text-right font-medium sm:w-28">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filledItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-5 text-muted-foreground">
                        Belum ada item.
                      </td>
                    </tr>
                  ) : (
                    filledItems.map((item) => (
                      <tr
                        key={item.id}
                        className="break-inside-avoid border-b border-foreground/10 align-top"
                      >
                        <td className="break-words py-2.5 pr-2">
                          {item.description.trim() || '-'}
                        </td>
                        <td className="break-words py-2.5 text-right tabular-nums">
                          {toNumber(item.qty)
                            ? numberFormat.format(toNumber(item.qty))
                            : '-'}
                        </td>
                        <td className="break-words py-2.5 text-right tabular-nums">
                          {toNumber(item.price)
                            ? money(toNumber(item.price))
                            : '-'}
                        </td>
                        <td className="break-words py-2.5 text-right tabular-nums">
                          {money(lineTotal(item))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-[15rem] space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{money(subtotal)}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        PPN {numberFormat.format(taxRate)}%
                      </span>
                      <span className="tabular-nums">{money(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-t border-foreground/30 pt-2 text-base font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums text-stamp">
                      {money(total)}
                    </span>
                  </div>
                </div>
              </div>

              {(hasPayment || invoice.notes.trim()) && (
                <div className="mt-8 grid gap-6 border-t border-foreground/10 pt-5 sm:grid-cols-2">
                  {hasPayment && (
                    <section>
                      <h3 className="text-xs font-medium text-muted-foreground">
                        Pembayaran
                      </h3>
                      <div className="mt-2 space-y-1 text-sm">
                        {invoice.bankName.trim() && <p>{invoice.bankName}</p>}
                        {invoice.bankAccount.trim() && (
                          <p className="tabular-nums">
                            No. rekening {invoice.bankAccount}
                          </p>
                        )}
                        {invoice.bankHolder.trim() && (
                          <p>a.n. {invoice.bankHolder}</p>
                        )}
                      </div>
                    </section>
                  )}
                  {invoice.notes.trim() && (
                    <section>
                      <h3 className="text-xs font-medium text-muted-foreground">
                        Catatan
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-sm">
                        {invoice.notes}
                      </p>
                    </section>
                  )}
                </div>
              )}
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-foreground/10 pt-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}
