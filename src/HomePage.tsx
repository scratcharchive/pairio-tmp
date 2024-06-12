import { FunctionComponent } from "react";
import LoginButton from "./LoginButton";
// import { getGitHubAccessToken } from "./App";

type Props = {
  // none
};

const HomePage: FunctionComponent<Props> = () => {
  return (
    <div>
      <h3>Pairio</h3>
      <LoginButton />
    </div>
  )
};

export default HomePage;
