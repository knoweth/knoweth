class DocumentsController < ApplicationController
  def index
    @documents = Document.all
  end

  def show
    @document = Document.find(params[:id])
  end

  def new
  end

  def create
    @document = Document.new(document_params)
    @document.save
    redirect_to @document
  end

  private
    def document_params
      params.require(:document).permit(:title)
    end
end
