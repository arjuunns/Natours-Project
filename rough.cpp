#include <bits/stdc++.h>
using namespace std;

int main()
{
    vector<int> positions = {3, 5, 2, 6};
    vector<int> healths = {10, 10, 15, 12};
    string directions = "RLRL";
    int n = positions.size();

    map<int, vector<int>> mp;
    for (int i = 0; i < n; i++)
        mp[positions[i]] = {i + 1, healths[i], directions[i]};
    stack<vector<int>> st;

    for (auto robot : mp)
    {
        if (!st.empty() and robot.second[2] != st.top()[2])
        {
            // while (!st.empty() and robot.second[2] != st.top()[2])
            // { // jab opposite direction m travel kar rhe honge
            if (robot.second[1] == st.top()[1])
            { // both same health, collide and dead
                st.pop();
            }
            else
            { // lower health => dead and upper health vala => health-1
                int maxHealth = max(st.top()[1], robot.second[1]);
                if (st.top()[1] == maxHealth)
                { // top ele of stack is powerful
                    st.top()[1]--;
                }
                else
                { // cuurent ele is powerful
                    st.pop();
                    robot.second[1]--;
                    st.push(robot.second);
                }
                // }
            }
        }
        else
            st.push(robot.second);
    }
    while (!st.empty())
    {
        cout << st.top()[1] << endl;
        st.pop();
    }
    // for (auto x : mp)
    // {
    //     cout << x.first << " => ";
    //     for (auto y : x.second)
    //     {
    //         cout << y << " ";
    //     }
    //     cout << endl;
    // }
    return 0;
}