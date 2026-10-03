const PageHeader = ({ title, description }: { title: string; description?: string }) => (
  <div className='mb-6 space-y-1'>
    <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
    {description && <p className='text-muted-foreground text-sm'>{description}</p>}
  </div>
)

export default PageHeader
