'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ResponsiveSelect } from '@/components/ui/ResponsiveSelect'
import { AlertCircle, Bell, Check, CheckCircle, Edit, Home, Info, Mail, Plus, Search, Settings, Trash2, User } from 'lucide-react'
import { useState } from 'react'

export default function StyleGuideClient() {
  const [selectedButton, setSelectedButton] = useState('primary')

  return (
    <div className='container mx-auto px-6 py-8 max-w-6xl'>
      <div className='mb-8'>
        <h1 className='text-4xl font-semibold text-notion-text-primary mb-2'>Design System</h1>
        <p className='text-notion-text-secondary'>Notion-inspired design system for Money Tracker</p>
      </div>

      <div className='space-y-12'>
        {/* Typography */}
        <section>
          <h2 className='text-2xl font-semibold text-notion-text-primary mb-6 pb-2 border-b border-notion-border'>Typography</h2>
          <Card>
            <div className='p-6 space-y-4'>
              <div>
                <h1 className='text-4xl font-semibold text-notion-text-primary'>Heading 1 - Semibold</h1>
                <p className='text-sm text-notion-text-secondary mt-1'>text-4xl font-semibold</p>
              </div>
              <div>
                <h2 className='text-3xl font-semibold text-notion-text-primary'>Heading 2 - Semibold</h2>
                <p className='text-sm text-notion-text-secondary mt-1'>text-3xl font-semibold</p>
              </div>
              <div>
                <h3 className='text-2xl font-semibold text-notion-text-primary'>Heading 3 - Semibold</h3>
                <p className='text-sm text-notion-text-secondary mt-1'>text-2xl font-semibold</p>
              </div>
              <div>
                <h4 className='text-xl font-semibold text-notion-text-primary'>Heading 4 - Semibold</h4>
                <p className='text-sm text-notion-text-secondary mt-1'>text-xl font-semibold</p>
              </div>
              <div>
                <p className='text-base text-notion-text-primary'>Body Text - Regular (Inter 400)</p>
                <p className='text-sm text-notion-text-secondary mt-1'>text-base</p>
              </div>
              <div>
                <p className='text-sm text-notion-text-secondary'>Secondary Text - Regular</p>
                <p className='text-xs text-notion-text-secondary mt-1'>text-sm text-notion-text-secondary</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Colors */}
        <section>
          <h2 className='text-2xl font-semibold text-notion-text-primary mb-6 pb-2 border-b border-notion-border'>Color Palette</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Card>
              <div className='p-4'>
                <div className='w-full h-20 bg-white border-2 border-notion-border rounded-lg mb-3'></div>
                <h4 className='font-medium text-notion-text-primary'>Background Light</h4>
                <p className='text-sm text-notion-text-secondary'>#FFFFFF</p>
              </div>
            </Card>
            <Card>
              <div className='p-4'>
                <div className='w-full h-20 bg-[#191919] rounded-lg mb-3'></div>
                <h4 className='font-medium text-notion-text-primary'>Background Dark</h4>
                <p className='text-sm text-notion-text-secondary'>#191919</p>
              </div>
            </Card>
            <Card>
              <div className='p-4'>
                <div className='w-full h-20 bg-notion-text-primary rounded-lg mb-3'></div>
                <h4 className='font-medium text-notion-text-primary'>Primary Text</h4>
                <p className='text-sm text-notion-text-secondary'>#2F2F2F</p>
              </div>
            </Card>
            <Card>
              <div className='p-4'>
                <div className='w-full h-20 bg-notion-text-secondary rounded-lg mb-3'></div>
                <h4 className='font-medium text-notion-text-primary'>Secondary Text</h4>
                <p className='text-sm text-notion-text-secondary'>#6B6B6B</p>
              </div>
            </Card>
            <Card>
              <div className='p-4'>
                <div className='w-full h-20 bg-notion-accent rounded-lg mb-3'></div>
                <h4 className='font-medium text-notion-text-primary'>Accent Blue</h4>
                <p className='text-sm text-notion-text-secondary'>#0F6FFF</p>
              </div>
            </Card>
            <Card>
              <div className='p-4'>
                <div className='w-full h-20 bg-notion-danger rounded-lg mb-3'></div>
                <h4 className='font-medium text-notion-text-primary'>Danger Red</h4>
                <p className='text-sm text-notion-text-secondary'>#E03E3E</p>
              </div>
            </Card>
            <Card>
              <div className='p-4'>
                <div className='w-full h-20 bg-notion-success rounded-lg mb-3'></div>
                <h4 className='font-medium text-notion-text-primary'>Success</h4>
                <p className='text-sm text-notion-text-secondary'>#2EAADC</p>
              </div>
            </Card>
            <Card>
              <div className='p-4'>
                <div className='w-full h-20 bg-notion-hover rounded-lg border border-notion-border mb-3'></div>
                <h4 className='font-medium text-notion-text-primary'>Hover Background</h4>
                <p className='text-sm text-notion-text-secondary'>#F7F7F7</p>
              </div>
            </Card>
            <Card>
              <div className='p-4'>
                <div className='w-full h-20 bg-notion-border rounded-lg border border-notion-border mb-3'></div>
                <h4 className='font-medium text-notion-text-primary'>Border</h4>
                <p className='text-sm text-notion-text-secondary'>#E5E5E5</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className='text-2xl font-semibold text-notion-text-primary mb-6 pb-2 border-b border-notion-border'>Buttons</h2>
          <Card>
            <div className='p-6 space-y-6'>
              <div>
                <h4 className='font-medium text-notion-text-primary mb-3'>Variants</h4>
                <div className='flex flex-wrap gap-3'>
                  <Button variant='primary'>Primary Button</Button>
                  <Button variant='secondary'>Secondary Button</Button>
                  <Button variant='ghost'>Ghost Button</Button>
                  <Button variant='danger'>Danger Button</Button>
                </div>
              </div>
              <div>
                <h4 className='font-medium text-notion-text-primary mb-3'>Sizes</h4>
                <div className='flex flex-wrap items-center gap-3'>
                  <Button
                    variant='primary'
                    size='sm'
                  >
                    Small
                  </Button>
                  <Button
                    variant='primary'
                    size='md'
                  >
                    Medium
                  </Button>
                  <Button
                    variant='primary'
                    size='lg'
                  >
                    Large
                  </Button>
                </div>
              </div>
              <div>
                <h4 className='font-medium text-notion-text-primary mb-3'>With Icons</h4>
                <div className='flex flex-wrap gap-3'>
                  <Button variant='primary'>
                    <Plus
                      size={16}
                      className='mr-2'
                    />
                    Add Item
                  </Button>
                  <Button variant='secondary'>
                    <Edit
                      size={16}
                      className='mr-2'
                    />
                    Edit
                  </Button>
                  <Button variant='danger'>
                    <Trash2
                      size={16}
                      className='mr-2'
                    />
                    Delete
                  </Button>
                </div>
              </div>
              <div>
                <h4 className='font-medium text-notion-text-primary mb-3'>States</h4>
                <div className='flex flex-wrap gap-3'>
                  <Button
                    variant='primary'
                    disabled
                  >
                    Disabled
                  </Button>
                  <Button
                    variant='secondary'
                    disabled
                  >
                    Disabled
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Icons */}
        <section>
          <h2 className='text-2xl font-semibold text-notion-text-primary mb-6 pb-2 border-b border-notion-border'>Icons (Lucide React)</h2>
          <Card>
            <div className='p-6'>
              <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6'>
                <div className='flex flex-col items-center gap-2'>
                  <Home
                    size={24}
                    className='text-notion-text-primary'
                  />
                  <span className='text-xs text-notion-text-secondary'>Home</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <Settings
                    size={24}
                    className='text-notion-text-primary'
                  />
                  <span className='text-xs text-notion-text-secondary'>Settings</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <User
                    size={24}
                    className='text-notion-text-primary'
                  />
                  <span className='text-xs text-notion-text-secondary'>User</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <Mail
                    size={24}
                    className='text-notion-text-primary'
                  />
                  <span className='text-xs text-notion-text-secondary'>Mail</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <Bell
                    size={24}
                    className='text-notion-text-primary'
                  />
                  <span className='text-xs text-notion-text-secondary'>Bell</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <Search
                    size={24}
                    className='text-notion-text-primary'
                  />
                  <span className='text-xs text-notion-text-secondary'>Search</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <Plus
                    size={24}
                    className='text-notion-text-primary'
                  />
                  <span className='text-xs text-notion-text-secondary'>Plus</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <Edit
                    size={24}
                    className='text-notion-text-primary'
                  />
                  <span className='text-xs text-notion-text-secondary'>Edit</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <Trash2
                    size={24}
                    className='text-notion-danger'
                  />
                  <span className='text-xs text-notion-text-secondary'>Trash</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <Check
                    size={24}
                    className='text-notion-success'
                  />
                  <span className='text-xs text-notion-text-secondary'>Check</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className='text-2xl font-semibold text-notion-text-primary mb-6 pb-2 border-b border-notion-border'>Form Elements</h2>
          <Card>
            <div className='p-6 space-y-6 max-w-md'>
              <Input
                label='Text Input'
                placeholder='Enter text...'
              />
              <Input
                label='Email Input'
                type='email'
                placeholder='email@example.com'
              />
              <ResponsiveSelect
                label='Dropdown Input'
                value={selectedButton}
                onChange={setSelectedButton}
                placeholder='Choose an option...'
                options={[
                  { value: '1', label: 'Option 1' },
                  { value: '2', label: 'Option 2' },
                  { value: '3', label: 'Option 3' },
                ]}
              />
              <Input
                label='Disabled Input'
                placeholder='Disabled'
                disabled
              />
            </div>
          </Card>
        </section>

        {/* Cards */}
        <section>
          <h2 className='text-2xl font-semibold text-notion-text-primary mb-6 pb-2 border-b border-notion-border'>Cards</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <div className='p-6'>
                <h3 className='text-lg font-semibold text-notion-text-primary mb-2'>Simple Card</h3>
                <p className='text-notion-text-secondary'>
                  Cards use subtle borders and clean backgrounds, following Notion's minimalist design.
                </p>
              </div>
            </Card>
            <Card>
              <div className='p-6'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-10 h-10 rounded-lg bg-notion-accent/10 flex items-center justify-center'>
                    <CheckCircle
                      size={20}
                      className='text-notion-accent'
                    />
                  </div>
                  <h3 className='text-lg font-semibold text-notion-text-primary'>Card with Icon</h3>
                </div>
                <p className='text-notion-text-secondary'>Cards can include icons and other visual elements.</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Alerts/Messages */}
        <section>
          <h2 className='text-2xl font-semibold text-notion-text-primary mb-6 pb-2 border-b border-notion-border'>Alerts & Messages</h2>
          <div className='space-y-4'>
            <div className='flex items-start gap-3 p-4 rounded-lg bg-notion-accent/10 border border-notion-accent/20'>
              <Info
                size={20}
                className='text-notion-accent mt-0.5'
              />
              <div>
                <h4 className='font-medium text-notion-text-primary'>Information</h4>
                <p className='text-sm text-notion-text-secondary'>This is an informational message.</p>
              </div>
            </div>
            <div className='flex items-start gap-3 p-4 rounded-lg bg-notion-success/10 border border-notion-success/20'>
              <CheckCircle
                size={20}
                className='text-notion-success mt-0.5'
              />
              <div>
                <h4 className='font-medium text-notion-text-primary'>Success</h4>
                <p className='text-sm text-notion-text-secondary'>Action completed successfully.</p>
              </div>
            </div>
            <div className='flex items-start gap-3 p-4 rounded-lg bg-notion-danger/10 border border-notion-danger/20'>
              <AlertCircle
                size={20}
                className='text-notion-danger mt-0.5'
              />
              <div>
                <h4 className='font-medium text-notion-text-primary'>Error</h4>
                <p className='text-sm text-notion-text-secondary'>Something went wrong. Please try again.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section>
          <h2 className='text-2xl font-semibold text-notion-text-primary mb-6 pb-2 border-b border-notion-border'>Spacing Scale</h2>
          <Card>
            <div className='p-6 space-y-2'>
              <div className='flex items-center gap-4'>
                <div className='w-2 h-8 bg-notion-accent'></div>
                <span className='text-notion-text-secondary'>0.5rem (8px)</span>
              </div>
              <div className='flex items-center gap-4'>
                <div className='w-3 h-8 bg-notion-accent'></div>
                <span className='text-notion-text-secondary'>0.75rem (12px)</span>
              </div>
              <div className='flex items-center gap-4'>
                <div className='w-4 h-8 bg-notion-accent'></div>
                <span className='text-notion-text-secondary'>1rem (16px)</span>
              </div>
              <div className='flex items-center gap-4'>
                <div className='w-6 h-8 bg-notion-accent'></div>
                <span className='text-notion-text-secondary'>1.5rem (24px)</span>
              </div>
              <div className='flex items-center gap-4'>
                <div className='w-8 h-8 bg-notion-accent'></div>
                <span className='text-notion-text-secondary'>2rem (32px)</span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
