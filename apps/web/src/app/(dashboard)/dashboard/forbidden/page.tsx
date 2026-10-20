export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-semibold">Accès non autorisé</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Votre rôle ne permet pas d&apos;utiliser cette application Desktop.
      </p>
    </div>
  );
}
