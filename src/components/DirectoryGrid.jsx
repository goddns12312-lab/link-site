import CategoryCard from './CategoryCard';

export default function DirectoryGrid({ categories, onBridge, bridgeAll }) {
  return (
    <section className="max-w-[1560px] mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start">
        {categories.map((cat) => (
          <CategoryCard key={cat.code} category={cat} onBridge={onBridge} bridgeAll={bridgeAll} />
        ))}
      </div>
    </section>
  );
}
