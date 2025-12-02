'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Dropdown,
  Badge,
  Modal,
  Toast,
  ToastContainer,
  Spinner,
  EmptyState,
} from '@/components/ui';

export default function StyleGuidePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Style Guide
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Design system and component library for Money Tracker
          </p>
        </div>

        {/* Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <ColorSwatch name="Primary" color="bg-sky-500" hex="#0ea5e9" />
            <ColorSwatch name="Success" color="bg-green-500" hex="#10b981" />
            <ColorSwatch name="Danger" color="bg-red-500" hex="#ef4444" />
            <ColorSwatch name="Warning" color="bg-orange-500" hex="#f59e0b" />
            <ColorSwatch name="Info" color="bg-blue-500" hex="#3b82f6" />
            <ColorSwatch name="Gray" color="bg-gray-500" hex="#6b7280" />
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Typography
          </h2>
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Heading 1</p>
                  <h1 className="text-2xl font-bold">The quick brown fox</h1>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Heading 2</p>
                  <h2 className="text-xl font-semibold">The quick brown fox</h2>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Heading 3</p>
                  <h3 className="text-lg font-semibold">The quick brown fox</h3>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Body</p>
                  <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Caption</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Buttons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Inputs */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Form Inputs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Text Input</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input label="Email" type="email" placeholder="you@example.com" />
                  <Input label="Password" type="password" placeholder="••••••••" />
                  <Input
                    label="With Error"
                    placeholder="Invalid input"
                    error="This field is required"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select & Dropdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select label="Native Select">
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>GBP - British Pound</option>
                  </Select>
                  <Dropdown
                    label="Custom Dropdown"
                    options={[
                      { value: 'USD', label: 'USD - US Dollar' },
                      { value: 'EUR', label: 'EUR - Euro' },
                      { value: 'GBP', label: 'GBP - British Pound' },
                      { value: 'JPY', label: 'JPY - Japanese Yen' },
                      { value: 'CAD', label: 'CAD - Canadian Dollar' },
                    ]}
                    value={selectedCurrency}
                    onChange={setSelectedCurrency}
                  />
                  <Dropdown
                    label="With Error"
                    options={[{ value: '1', label: 'Option 1' }]}
                    error="Please select an option"
                    placeholder="Select..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Badges
          </h2>
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  This is a default card with shadow and border
                </p>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  This is an outlined card without shadow
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Modal & Toast */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Modal & Toast
          </h2>
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setToastType('success');
                    setShowToast(true);
                  }}
                >
                  Show Success Toast
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setToastType('error');
                    setShowToast(true);
                  }}
                >
                  Show Error Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spinner */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Spinner
          </h2>
          <Card>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Spinner size="sm" />
                  <p className="text-xs text-gray-500 mt-2">Small</p>
                </div>
                <div className="text-center">
                  <Spinner size="md" />
                  <p className="text-xs text-gray-500 mt-2">Medium</p>
                </div>
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="text-xs text-gray-500 mt-2">Large</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Empty State */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Empty State
          </h2>
          <Card>
            <CardContent>
              <EmptyState
                icon="📭"
                title="No items found"
                description="Get started by creating your first item"
                action={<Button>Create Item</Button>}
              />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          This is an example modal dialog. You can use it for confirmations, forms, or any
          other content that needs user attention.
        </p>
      </Modal>

      {/* Toast */}
      {showToast && (
        <ToastContainer>
          <Toast
            message={
              toastType === 'success'
                ? 'Action completed successfully!'
                : 'An error occurred!'
            }
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        </ToastContainer>
      )}
    </div>
  );
}

function ColorSwatch({ name, color, hex }: { name: string; color: string; hex: string }) {
  return (
    <div>
      <div className={`${color} w-full h-20 rounded-lg mb-2`} />
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{hex}</p>
    </div>
  );
}
