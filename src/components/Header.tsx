export default function Header() {
    return (
        <header className="w-full bg-white shadow-md px-2 py-2 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
                Receipt Tracker
            </h1>
            <button className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                Login
            </button>
        </header>
    )
}
