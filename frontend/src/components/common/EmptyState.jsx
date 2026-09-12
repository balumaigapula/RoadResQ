export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-lg border border-dashed border-ash-300 bg-white">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-ash-100 flex items-center justify-center mb-4">
          <Icon size={24} className="text-ash-400" />
        </div>
      )}
      <h3 className="font-display font-semibold text-navy-700">{title}</h3>
      {description && <p className="text-sm text-ash-500 mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
