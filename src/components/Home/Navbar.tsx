import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode as a named export
import cookies from 'js-cookie';
import { FaBell, FaQuestionCircle, FaCog } from 'react-icons/fa';

interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: any; // Add this to allow other fields like `name`, `profileImage`
}

interface DecodedToken extends JwtPayload {
  name?: string;
  profileImage?: string;
}

// Define getCurrUserInfo in the same file
export function getCurrUserInfo() {
  const config = { hostname: window.location.hostname };
  console.log('config Info:', config);

  if (config.hostname.includes("localhost")) {
    return {};
  }

  const cookie = cookies.get("Authorization");
  console.log('cookie Info:', cookie);

  if (!cookie || cookie.split(" ").length < 2) {
    return {};
  }

  try {
    // Use jwtDecode as a named export
    return jwtDecode<DecodedToken>(cookie.split(" ")[1]);
  } catch (err) {
    console.error("Error decoding token:", err);
    return {}; // Return an empty object if decoding fails
  }
}

const Navbar = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = getCurrUserInfo();
    console.log('User Info:', userInfo); // Add this to log userInfo
    if (Object.keys(userInfo).length > 0) {
      setUser(userInfo);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
      <div className="navbar">
        <div className="nav-icons">
          <FaBell className="icon" />
          <FaQuestionCircle className="icon" />
          <FaCog className="icon" />
        </div>
        {user ? (
            <div className="profile">
              {user.profileImage && (
                  <img src={user.profileImage} alt="profile" className="profile-img" />
              )}
              <p>{user.name || 'Unknown User'}</p>
            </div>
        ) : (
            <p>Not logged in</p>
        )}
      </div>
  );
};

export default Navbar;
