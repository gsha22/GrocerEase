export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} GrocerEase &middot; Local discovery, no
        checkout
      </div>
    </footer>
  );
}
