# Component Splitting and Micro-Splitting

## Component Splitting

Split components when a section has a nameable responsibility, its own state, real repetition, or when extraction makes the main component read as clear composition. Do not extract just because JSX can become a function.

### Micro-Splitting Preference

Split by **visual/functional responsibility**, not by size. A section becomes a subcomponent when the name helps the reader understand the composition:

```tsx
// hero-section.tsx - main component orchestrates subcomponents
export function HeroSection() {
  const { data: featured } = useSuspenseQuery(orpc.home.hero.get.queryOptions());
  const backdropUrl = getBackdropUrl(featured?.backdrop_path);

  if (!featured || !backdropUrl) {
    return null;
  }

  return (
    <section className="relative h-[50vh] ...">
      <HeroSectionBackground backdropUrl={backdropUrl} />
      <div className="absolute bottom-0 ...">
        <HeroSectionStatus />
        <HeroSectionTitle featured={featured} />
        <HeroSectionActions mediaId={featured.id} />
      </div>
    </section>
  );
}

// Subcomponents in the same file - each has one responsibility
function HeroSectionBackground({ backdropUrl }: { backdropUrl: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img src={backdropUrl} ... />
      <div className="absolute inset-0 bg-linear-to-t ..." />
    </div>
  );
}

function HeroSectionStatus() {
  return (
    <span className="inline-flex items-center ...">
      <Sparkles className="size-3" />
      Featured
    </span>
  );
}

function HeroSectionTitle({ featured }: { featured: FeaturedMedia }) {
  return (
    <>
      <h1 className="text-2xl ...">{featured.title}</h1>
      <div className="flex items-center ...">...</div>
      {featured.overview && <p className="...">{featured.overview}</p>}
    </>
  );
}

function HeroSectionActions({ mediaId }: { mediaId: number }) {
  return (
    <div className="flex flex-wrap gap-2 ...">
      <Button>Watch</Button>
      <Link to="/media/$id" params={{ id: String(mediaId) }}>
        <Button variant="glass">Details</Button>
      </Link>
    </div>
  );
}
```

### Benefits

- Main component JSX becomes **descriptive** and reads like an outline.
- Each subcomponent has a clear responsibility.
- Changes in one section do not affect the others.
- Code review is easier because changes are localized.

### When to Apply

| Signal | Becomes subcomponent? |
|-------|------------------------|
| Nameable visual responsibility | Yes (`*Background`, `*Header`, `*Actions`) |
| Own state or handlers | Yes |
| Real repetition | Yes, if it reduces duplication with the same meaning |
| Long JSX without a semantic boundary | No, simplify in place |
| Extraction only trades lines for imports | No |

### Subcomponent Naming

Parent component prefix + descriptive suffix:

- `HeroSection` -> `HeroSectionBackground`, `HeroSectionTitle`, `HeroSectionActions`
- `MediaCard` -> `MediaCardPoster`, `MediaCardInfo`, `MediaCardBadges`
- `DownloadsCard` -> `DownloadsCardHeader`, `DownloadsCardFooter`, `DownloadsCardProgress`

### Subcomponent Organization

| Scenario | Approach |
|---------|----------|
| Strongly coupled, <50 lines | Same file |
| Strongly coupled, 50+ lines | Separate file |
| 1-2 subcomponents | Prefix the name (`downloads-card-status-icon.tsx`) |
| 3+ subcomponents | Own folder with short prefix (see `references/structure.md`) |
