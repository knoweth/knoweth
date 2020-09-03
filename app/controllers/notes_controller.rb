class NotesController < ApplicationController
  # Create a note and redirect back to its associated document
  def create
    @document = Document.find(params[:document_id])
    @note = @document.notes.create(note_params)
    redirect_to document_path(@document)
  end

  def update
  end

  def destroy
    @document = Document.find(params[:document_id])
    @note = @document.notes.find(params[:id])
    @note.destroy
    redirect_to document_path(@document)
  end 
  
  private
    def note_params
      params.require(:note).permit(:left, :right)
    end
end
