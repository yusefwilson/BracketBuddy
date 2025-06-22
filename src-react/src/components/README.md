# Documentation

Here is the current saving and loading architecture for tournaments and brackets:

- in App.tsx, on mount, all tournaments are loaded from disk. The last tournament in the list, and the last bracket in the tournament's list are set as the current tournament and bracket, respecively.
- this state is stored in the App in useState hooks, and is accessible to all components via the CURRENT_STATE context.
- Home.tsx loads all tournaments from disk as well, and displays them in a list.
- TournamenView.tsx loads the tournament from the context. It can display the BracketInputModal, which adds a bracket to a tournament, and displays BracketInfoCards, which have a remove button that deletes their bracket from the tournament. 