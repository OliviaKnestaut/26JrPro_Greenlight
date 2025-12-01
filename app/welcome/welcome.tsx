import greenlightTemp from "./GreenlightTemp.png";
import { DatabaseOutlined, AppstoreOutlined } from '@ant-design/icons';

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={greenlightTemp}
              alt="Greenlight"
              className="block w-full"
            />
          </div>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            <p className="leading-6 text-gray-700 dark:text-gray-200 text-center">
              Progress:
            </p>
            <ul>
              {resources.map(({ href, text, icon }) => (
                <li key={href}>
                  <a
                    className="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500"
                    href={href}
                    rel="noreferrer"
                  >
                    {icon}
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}

const resources = [
  {
    href: "database-dump",
    text: "Database Dump (GraphQL)",
    icon: (
      <DatabaseOutlined className="text-gray-600 group-hover:text-current dark:text-gray-300" style={{ fontSize: 20 }} />
    ),
  },
  {
    href: "antd-example",
    text: "App Layout & Ant Design Setup",
    icon: (
      <AppstoreOutlined className="text-gray-600 group-hover:text-current dark:text-gray-300" style={{ fontSize: 20 }} />
    ),
  },
];
