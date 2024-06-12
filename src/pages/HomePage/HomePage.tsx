import { FunctionComponent } from "react";
import LoginButton from "../../LoginButton";
import { Hyperlink } from "@fi-sci/misc";
import useRoute from "../../useRoute";
import useGitHubAccessToken from "../../useGitHubAccessToken";
// import { getGitHubAccessToken } from "./App";

type Props = {
  // none
};

const HomePage: FunctionComponent<Props> = () => {
  const { setRoute } = useRoute();
  const { userId } = useGitHubAccessToken();
  return (
    <div style={{padding: 30}}>
      <h3>Pairio</h3>
      <LoginButton />
      <hr />
      {userId && (
        <div>
          <div>
            <Hyperlink onClick={() => {
              setRoute({page: 'apps'})
            }}>Apps</Hyperlink>
          </div>
        </div>
      )}
    </div>
  )
};

export default HomePage;
