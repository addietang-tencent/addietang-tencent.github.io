import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  isAdmin: boolean;
}

interface UserRoleContextType {
  isAdmin: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;
  login: (userId: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  toggleRole: () => void;
}

const UserRoleContext = createContext<UserRoleContextType>({
  isAdmin: false,
  isLoggedIn: false,
  currentUser: null,
  login: () => ({ success: false }),
  logout: () => {},
  toggleRole: () => {},
});

// Mock 用户数据：管理员账号和普通成员账号
const MOCK_USERS: Array<{ id: string; password: string; isAdmin: boolean }> = [
  { id: "admin001", password: "Admin@123", isAdmin: true },
  { id: "member001", password: "Member@123", isAdmin: false },
  { id: "member002", password: "Member@456", isAdmin: false },
];

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const isLoggedIn = currentUser !== null;
  const isAdmin = currentUser?.isAdmin ?? false;

  const login = (userId: string, password: string): { success: boolean; error?: string } => {
    const user = MOCK_USERS.find(u => u.id === userId && u.password === password);
    if (!user) {
      return { success: false, error: "用户 ID 或密码错误，请重新输入" };
    }
    setCurrentUser({ id: user.id, isAdmin: user.isAdmin });
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const toggleRole = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, isAdmin: !currentUser.isAdmin });
    }
  };

  return (
    <UserRoleContext.Provider value={{ isAdmin, isLoggedIn, currentUser, login, logout, toggleRole }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}
