// @flow
/**
 * Dialog for Creating or Editing a Conversation.
 *
 * * Select a title for the Conversation (optional)
 * * Select participants for the Conversation
 */
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faCheckSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare';
import * as React from 'react'
import { LayerReactComponents, layerClient } from '../../get-layer';

const { IdentityList } = LayerReactComponents;

type Props = {
  conversationId: string,
  onSave: Function,
  onCancel: Function
}

type State = {
  selectedIdentities: any,
  conversationName: any,
  initialIdentities: any,
  initialTitle: any,
  isDirty: boolean
}

class CreateConversationDialog extends React.Component<Props, State> {

  /**
   * User has clicked the Save button; save the new conversation or perform updates upon an existing Conversation.
   */
  onSave = () => {

    // Abort if no changes
    if (!this.state.isDirty) return this.onClose();

    // Update the existing Conversation
    if (this.props.conversationId) {
      const conversation = layerClient.getConversation(this.props.conversationId);
      if (conversation) {
        conversation.replaceParticipants(this.state.selectedIdentities);
        conversation.setMetadataProperties({ conversationName: this.state.conversationName });
        if (this.props.onSave) this.props.onSave(conversation);
      }
    }

    // Create a new Conversation
    else {
      const conversation = layerClient.createConversation({
        participants: this.state.selectedIdentities,
        distinct: this.state.selectedIdentities.length === 1,
        metadata: {
          conversationName: this.state.conversationName,
        }
      });
      if (this.props.onSave) this.props.onSave(conversation);
    }
  }

  /**
   * This Component is recreated each time its used. If its being recreated to operate upon a Conversation,
   * insure that we have that Conversation loaded and that its properly setup.
   */
  componentWillMount() {
    const conversation = this.props.conversationId ? layerClient.getConversation(this.props.conversationId) : null;
    if (conversation && conversation.isLoading) {
      conversation.once('conversations:loaded', () => this.initConversation(conversation), this);
    } else {
      this.initConversation(conversation);
    }
  }

  /**
   * Setup our conversation -- or if we are creating a new Conversation, setup our initial state.
   */
  initConversation(conversation: any) {
    this.setState({
      selectedIdentities: conversation ? conversation.participants : [],
      initialIdentities:  conversation ? conversation.participants : [],
      initialTitle:  conversation ? conversation.metadata.conversationName || '' : '',
      isDirty: false
    });
  }

  /**
   * Hack to determine if the user has made changes to the Conversation that should be saved.
   */
  isDirty(name: string, identities: any) {
    return name !== this.state.initialTitle || identities.map(obj => obj.id).sort().join(',') !== this.state.initialIdentities.map(obj => obj.id).sort().join(',');
  }

  /**
   * Update the set of selected Identies and the isDirty flag after each selection change event.
   */
  onSelectionChange = (event: any) => {
    this.setState({
      selectedIdentities: event.target.selectedIdentities,
      isDirty: this.isDirty(this.state.conversationName, event.target.selectedIdentities)
    });
  }

  /**
   * Update the Conversation Name and isDirty flag after any changes to the title
   */
  updateName = (event: any) => {
    const conversationName = event.target.value;
    this.setState({
      conversationName,
      isDirty: this.isDirty(conversationName, this.state.selectedIdentities)
   });
  }

  /**
   * Close the dialog if the user clicked on the background of the dialog, or if anyone has called `this.onClose()`
   */
  onClose = (event: any) => {
    if (!event || event.target.classList.contains('dialog')) this.props.onCancel();
  }

  /**
   * Render the Edit Conversation Dialog
   */
  render() {
    const { selectedIdentities } = this.state;

    const conversation = this.props.conversationId ? layerClient.getConversation(this.props.conversationId) : null;

    return (
      <div onClick={this.onClose} className={"dialog " + (this.state.isDirty ? ' dialog-dirty' : '')} >
        <div className="participant-list-container dialog-container">
          <div className="conversation-values">
            <input
              defaultValue={conversation ? conversation.metadata.conversationName : ''}
              onKeyDown={() => setTimeout(() => this.updateName, 1)}
              onChange={this.updateName}
              placeholder='Conversation title...' />
              <a href='#' onClick={this.onSave}>
              <FontAwesomeIcon icon={faCheckSquare} />

              </a>
          </div>
          <div className="panel-section-header">PARTICIPANTS</div>
          <IdentityList
            onIdentitySelectionComplete={this.onSelectionChange}
            selectedIdentities={selectedIdentities}
          />
        </div>
      </div>
    );
  }
}

export default CreateConversationDialog;
